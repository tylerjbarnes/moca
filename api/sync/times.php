<?php

//////////
// Load //
//////////

/**
 * Load Time
 * @param  String $id
 * @return Object time data
 */
function hpm_api_load_time( $id ) {

    $user_id = hpm_user_id();
    $user_role = hpm_user_role();

    global $wpdb;
    $time_table = $wpdb->prefix . 'hpm_times';
    $where = "WHERE id = '$id'";

    // Secure
    switch ($user_role) {

        case "administrator":
        case "manager":
            break;

        case "contractor":
            $where .= " AND worker_id = $user_id";
            break;

        default:
            return null;

    }

    // Return
    $time_data = $wpdb->get_row( "SELECT * FROM $time_table $where" );
    return hpm_response( true, $time_data );

}

/**
 * Load Times
 * @return Array
 */
function hpm_api_load_times($filters = []) {

    $user_id = hpm_user_id();
    $user_role = hpm_user_role();

    global $wpdb;
    $time_table = $wpdb->prefix . 'hpm_times';
    $project_table = $wpdb->prefix . 'hpm_projects';
    $person_table = $wpdb->prefix . 'hpm_persons';
    $where = "WHERE 1 = 1";

    // Secure
    switch ($user_role) {

        case "administrator":
        case "manager":
            break;

        case "contractor":
            $where .=  " AND worker_id = '$user_id'";
            break;

        default:
            return null;

    }

    // Filter
    foreach( $filters as $key=>$value ) {

        switch ($key) {
            case "archived":
                $value = $value == "true" ? 1 : 0;
                $billing_start = hpm_billing_cycle_start_date_string();
                $in_current_cycle = $value ?
                    "times.date < '$billing_start'" : // Get Archived
                    "times.date >= '$billing_start'"; // Get Unarchived
                $where .= " AND (
                    (times.project_id IS NULL AND clients.archived = $value) OR
                    (times.project_id IS NOT NULL AND projects.archived = $value) OR
                    $in_current_cycle
                )";
                break;

            case "start":
                $where .= " AND date >= '$value'";
                break;

            case "end":
                $where .= " AND date <= '$value'";
                break;

            default:
                $where .= " AND times.$key = '$value'";
        }

    }

    // Return
    return $wpdb->get_results( "
    SELECT times.* FROM $time_table times
    LEFT JOIN $project_table projects ON times.project_id = projects.id
    LEFT JOIN $person_table clients ON times.client_id = clients.id
    $where
    " );

}


//////////
// Sync //
//////////

/**
 * Create Time
 * @param  Object $time_data
 * @param  String $socket_id
 */
function hpm_api_create_time( $time_data, $socket_id ) {

    // Secure
    $user_id = hpm_user_id();
    $role = hpm_user_role();
    if ( !in_array( $role, ["administrator", "manager"] )
        && $user_id != $time_data["worker_id"] ) {
        return;
    }

    // Stripslahes
    $time_data["memo"] = stripslashes( $time_data["memo"] );

    // Build & Save Activity
    $activity = new stdClass();
    $activity->activity_type = "create";
    $activity->object_type = "times";
    $activity->object_id = $time_data["id"];
    $activity->property_name = null;
    $activity->property_value = $time_data;
    $activity->author_id = hpm_user_id();
    hpm_save_activities( [$activity] );

    //////////
    // Push //
    //////////

    $pusher = hpm_get_pusher();

    // Push to Managers
    $pusher->trigger('private-managers', 'add-time', $time_data, $socket_id);

    // Push to Contractor
    $worker_id = hpm_get_time( $activity->object_id )->worker_id;
    $worker_role = $worker_id ? hpm_user_role( $worker_id ) : null;
    if ( $worker_role == "contractor" ) {
        $pusher->trigger('private-contractor-'.$worker_id, 'add-time', $time_data, $socket_id);
    }

    // Notify Admin if Client Used All Hours
    if ( $time_data["client_id"] ) {
        $client = hpm_get_person( $time_data["client_id"] );
        if ($client->balance <= 0) {
            hpm_send_client_used_all_hours_notification( $client->id );
        }
    }

}

/**
 * Update Time
 * @param  String $time_id
 * @param  Object $time_data
 * @param  String $socket_id
 */
function hpm_api_update_time( $time_id, $time_data, $socket_id ) {

    // Secure
    $user_id = hpm_user_id();
    $worker_id = hpm_get_time( $time_id )->worker_id;
    $role = hpm_user_role();
    if ( !in_array( $role, ["administrator", "manager"] )
        && $user_id != $worker_id ) {
        return;
    }

    // Build & Save Activities
    $activities = [];
    foreach ($time_data as $key => $value) {

        // Stripslahes
        if ($key == 'memo') {
            $value = stripslashes( $value );
        }

        $activity = new stdClass();
        $activity->activity_type = "update";
        $activity->object_type = "times";
        $activity->object_id = $time_id;
        $activity->property_name = $key;
        $activity->property_value = $value;
        $activity->author_id = hpm_user_id();
        $activities[] = $activity;
    }
    hpm_save_activities( $activities );

    //////////
    // Push //
    //////////

    $pusher = hpm_get_pusher();
    $push_data = [
        "id" => $time_id,
        "data" => $time_data
    ];

    // Push to Manager
    $pusher->trigger('private-managers', 'update-time', $push_data, $socket_id);

    // Push to Contractor
    $worker_role = $worker_id ? hpm_user_role( $worker_id ) : null;
    if ( $worker_role == "contractor" ) {
        $pusher->trigger('private-contractor-'.$worker_id, 'update-time', $push_data, $socket_id);
    }

    // Notify Admin if Client Used All Hours
    $time = hpm_get_time( $time_id );
    if ( $time->client_id ) {
        $client = hpm_get_person( $time->client_id );
        if ($client->balance <= 0) {
            hpm_send_client_used_all_hours_notification( $client->id );
        }
    }

}

/**
 * Delete Time
 * @param  String $time_id
 * @param  String $socket_id
 */
function hpm_api_delete_time( $time_id, $socket_id ) {

    // Fetch & Cache Worker ID
    $worker_id = hpm_get_time( $time_id )->worker_id;
    $worker_role = $worker_id ? hpm_user_role( $worker_id ) : null;

    // Secure
    $user_id = hpm_user_id();
    $role = hpm_user_role();
    if ( !in_array( $role, ["administrator", "manager"] )
        && $user_id != $worker_id ) {
        return;
    }

    // Build & Save Activity
    $activity = new stdClass();
    $activity->activity_type = "delete";
    $activity->object_type = "times";
    $activity->object_id = $time_id;
    $activity->property_name = null;
    $activity->property_value = null;
    $activity->author_id = hpm_user_id();
    hpm_save_activities( [$activity] );

    //////////
    // Push //
    //////////

    $pusher = hpm_get_pusher();

    // Push to Managers
    $pusher->trigger('private-managers', 'remove-time', $time_id, $socket_id);

    // Push to Contractor
    if ( $worker_role == "contractor" ) {
        $pusher->trigger('private-contractor-'.$worker_id, 'remove-time', $time_id, $socket_id);
    }

}
