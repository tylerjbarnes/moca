<?php

//////////
// Load //
//////////

/**
 * Load Message
 * @param  String $id
 * @return Object message data
 */
function hpm_api_load_message( $id ) {

    $user_id = hpm_user_id();
    $user_role = hpm_user_role();

    global $wpdb;
    $message_table = $wpdb->prefix . 'hpm_messages';
    $project_table = $wpdb->prefix . 'hpm_projects';
    $where = "WHERE messages.id = '$id'";

    // Secure
    switch ($user_role) {

        case "administrator":
        case "manager":
            break;

        case "contractor":
            $where .=  " AND projects.contractor_id = $user_id";
            break;

        default:
            return null;

    }

    // Return
    $row = $wpdb->get_row( "
        SELECT messages.* FROM $message_table messages
        LEFT JOIN $project_table projects ON messages.project_id = projects.id
        $where
    " );
    return hpm_typify_message_data( $row );

}

/**
 * Load Messages
 * @return Array
 */
function hpm_api_load_messages($filters = []) {

    $user_id = hpm_user_id();
    $user_role = hpm_user_role();

    global $wpdb;
    $message_table = $wpdb->prefix . 'hpm_messages';
    $project_table = $wpdb->prefix . 'hpm_projects';
    $person_table = $wpdb->prefix . 'hpm_persons';
    $where = "WHERE 1 = 1";

    // Secure
    switch ($user_role) {

        case "administrator":
        case "manager":
            break;

        case "contractor":
            $where .=  " AND projects.contractor_id = '$user_id'";
            break;

        default:
            return null;

    }

    // Filter
    foreach( $filters as $key=>$value ) {

        switch ($key) {
            case "archived":
                $value = $value == "true" ? 1 : 0;
                $where .= " AND $key = '$value'";
                break;
            case "parent_id":
                if ($value == "") {
                    $where .= " AND $key IS NULL";
                } else {
                    $where .= " AND $key = '$value'";
                }
                break;

            default:
                $where .= " AND $key = '$value'";
        }

    }

    // Fetch
    $rows = $wpdb->get_results( "
        SELECT messages.* FROM $message_table messages
        LEFT JOIN $project_table projects ON messages.project_id = projects.id
        $where
    " );

    // Prepare & Return
    return array_map( function( $row ) {
        return hpm_typify_message_data( $row );
    }, $rows);

}

function hpm_typify_message_data( $row ) {
    $row->content = stripslashes( $row->content );
    $row->meta = json_decode( $row->meta );

    $row->cycle = (int) $row->cycle;
    $row->resolved = $row->resolved == 1;
    return $row;
}

function hpm_typify_message_data_from_js( $data ) {
    $data['content'] = stripslashes( $data['content'] );
    $data['cycle'] = (int) $data['cycle'];
    $data['resolved'] = $data['resolved'] == 'true';
    return $data;
}


//////////
// Sync //
//////////

/**
 * Create Message
 * @param  Object $message_data
 * @param  String $socket_id
 */
function hpm_api_create_message( $message_data, $socket_id ) {

    // Secure
    $user_id = hpm_user_id();
    $role = hpm_user_role();
    if ( !in_array( $role, ["administrator", "manager"] )
        && $user_id != $message_data["author_id"] ) {
        return;
    }

    // Prepare Meta JSON
    $flattened_message_data = $message_data;
    $flattened_message_data["meta"] = json_encode( $flattened_message_data["meta"] );

    // Build & Save Activity
    $activity = new stdClass();
    $activity->activity_type = "create";
    $activity->object_type = "messages";
    $activity->object_id = $message_data["id"];
    $activity->property_name = null;
    $activity->property_value = $flattened_message_data;
    $activity->author_id = hpm_user_id();
    hpm_save_activities( [$activity] );

    //////////
    // Push //
    //////////

    // Strip Slashes
    // error_log( $message_data["resolved"] );
    // $message_data["content"] = stripslashes( $message_data["content"] );
    $message_data = hpm_typify_message_data_from_js( $message_data );

    $pusher = hpm_get_pusher();

    // Push to Managers
    $pusher->trigger('private-managers', 'add-message', $message_data, $socket_id);

    // Push to Contractor
    $project_id = hpm_get_message( $activity->object_id )->project_id;
    $contractor_id = hpm_get_project( $project_id )->contractor_id;
    if ( $contractor_id ) {
        $pusher->trigger('private-contractor-'.$contractor_id, 'add-message', $message_data, $socket_id);
    }

}

/**
 * Update Message
 * @param  String $message_id
 * @param  Object $message_data
 * @param  String $socket_id
 */
function hpm_api_update_message( $message_id, $message_data, $socket_id ) {

    // Secure
    $user_id = hpm_user_id();
    $role = hpm_user_role();
    $can_manage = in_array( $role, ["administrator", "manager"] );
    $owns_message = $user_id == hpm_get_message( $message_id )->author_id;
    $can_modify_message = $can_manage || $owns_message;
    $project_contractor_id = hpm_get_project( hpm_get_message( $message_id )->project_id )->contractor_id;

    // Build & Save Activities
    $activities = [];
    foreach ($message_data as $key => $value) {

        // Contractors can only modify "resolved".
        if ( !$can_modify_message &&
            (
                $key != "resolved" ||
                $project_contractor_id != $user_id
            )
        ) { return null; }

        $activity = new stdClass();
        $activity->activity_type = "update";
        $activity->object_type = "messages";
        $activity->object_id = $message_id;
        $activity->property_name = $key;
        $activity->property_value = $value;
        $activity->author_id = hpm_user_id();
        $activities[] = $activity;
    }
    hpm_save_activities( $activities );

    //////////
    // Push //
    //////////

    // Strip Slashes
    if ( array_key_exists( "content", $message_data) ) {
        $message_data["content"] = stripslashes( $message_data["content"] );
    }

    $pusher = hpm_get_pusher();
    $push_data = [
        "id" => $message_id,
        "data" => $message_data
    ];

    // Push to Manager
    $pusher->trigger('private-managers', 'update-message', $push_data, $socket_id);

    // Push to Contractor
    $project_id = hpm_get_message( $activity->object_id )->project_id;
    $contractor_id = hpm_get_project( $project_id )->contractor_id;
    if ( $contractor_id ) {
        $pusher->trigger('private-contractor-'.$contractor_id, 'update-message', $push_data, $socket_id);
    }

}

/**
 * Delete Message
 * @param  String $message_id
 * @param  String $socket_id
 */
function hpm_api_delete_message( $message_id, $socket_id ) {

    // Fetch & Cache Author & Contractor ID
    $author_id = hpm_get_message( $message_id )->author_id;
    $project_id = hpm_get_message( $message_id )->project_id;
    $contractor_id = hpm_get_project( $project_id )->contractor_id;

    // Secure
    $user_id = hpm_user_id();
    $role = hpm_user_role();
    if ( !in_array( $role, ["administrator", "manager"] )
        && $user_id != $author_id ) {
        return;
    }

    // Clean Up Dependencies
    hpm_clean_up_after_message( $message_id );

    // Build & Save Activity
    $activity = new stdClass();
    $activity->activity_type = "delete";
    $activity->object_type = "messages";
    $activity->object_id = $message_id;
    $activity->property_name = null;
    $activity->property_value = null;
    $activity->author_id = hpm_user_id();
    hpm_save_activities( [$activity] );

    //////////
    // Push //
    //////////

    $pusher = hpm_get_pusher();

    // Push to Managers
    $pusher->trigger('private-managers', 'remove-message', $message_id, $socket_id);

    // Push to Contractor
    if ( $contractor_id ) {
        $pusher->trigger('private-contractor-'.$contractor_id, 'remove-message', $message_id, $socket_id);
    }

}


function hpm_clean_up_after_message( $message_id ) {

    global $wpdb;
    $message_table = $wpdb->prefix . 'hpm_messages';

    // Delete Answer
    $wpdb->delete(
        $message_table,
        array(
            "parent_id" => $message_id
        )
    );

}
