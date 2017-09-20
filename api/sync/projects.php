<?php

//////////
// Load //
//////////

/**
 * Load Project
 * @param  String $id
 * @return Object project data
 */
function hpm_api_load_project( $id ) {

    $user_id = hpm_user_id();
    $user_role = hpm_user_role();

    global $wpdb;
    $project_table = $wpdb->prefix . 'hpm_projects';
    $where = "WHERE id = '$id'";

    // Secure
    switch ($user_role) {

        case "administrator":
        case "manager":
            break;

        case "contractor":
            $where .= " AND contractor_id = $user_id";
            $where .= " AND archived = 0";
            break;

        default:
            return null;

    }

    // Return
    $row = $wpdb->get_row( "SELECT * FROM $project_table $where" );
    return hpm_typify_data_from_db( $row );

}

/**
 * Load Projects
 * @return Array
 */
function hpm_api_load_projects($filters = []) {

    $user_id = hpm_user_id();
    $user_role = hpm_user_role();

    global $wpdb;
    $project_table = $wpdb->prefix . 'hpm_projects';

    // Secure
    switch ($user_role) {

        case "administrator":
        case "manager":
            $where = "WHERE 1 = 1";
            break;

        case "contractor":
            $where = "WHERE 1 = 1";
            // $where =  "WHERE contractor_id = '$user_id'";
            break;

        default:
            return null;

    }

    // Filter
    foreach( $filters as $key=>$value ) {
        if ($value == "true") { $value = 1; }
        if ($value == "false") { $value = 0; }
        $where .= " AND $key = '$value'";
    }

    // Typify & Return
    $results = $wpdb->get_results( "SELECT * FROM $project_table $where" );
    return array_map(function($row){
        return hpm_typify_data_from_db( $row );
    }, $results);

}


/**
 * Load Project Dependents
 * @param  String $project_id
 * @return Object             associated messages, resources, etc.
 */
function hpm_api_load_project_dependents( $project_id ) {

    global $wpdb;

    // Resource Data
    $resource_table = $wpdb->prefix . 'hpm_resources';
    $resource_data = $wpdb->get_results(
        "SELECT * FROM $resource_table WHERE project_id = '$project_id';"
    );
    $resource_data = array_map( function( $resource ) {
        $resource->content = json_decode( $resource->content );
        $resource->content->body = stripslashes( $resource->content->body );
        return $resource;
    }, $resource_data);

    // Message Data
    $message_table = $wpdb->prefix . 'hpm_messages';
    $message_data = $wpdb->get_results(
        "SELECT * FROM $message_table WHERE project_id = '$project_id';"
    );
    $message_data = array_map( function( $message ) {
        $message->content = stripslashes( $message->content );
        return $message;
    }, $message_data);

    // Time Data
    $time_table = $wpdb->prefix . 'hpm_times';
    $time_data = $wpdb->get_results(
        "SELECT * FROM $time_table WHERE project_id = '$project_id';"
    );

    // Combine & Return
    return [
        "resources" => $resource_data,
        "messages" => $message_data,
        "times" => $time_data
    ];

}


//////////
// Sync //
//////////

/**
 * Create Project
 * @param  Object $project_data
 * @param  String $socket_id
 */
function hpm_api_create_project( $project_data, $socket_id ) {

    $project_data = hpm_typify_data_from_js( $project_data );

    // Secure
    $role = hpm_user_role();
    if (!in_array($role, ["administrator", "manager"])) {
        return null;
    }

    // Stripslahes
    $project_data["name"] = stripslashes( $project_data["name"] );

    // Build & Save Activity
    $activity = new stdClass();
    $activity->activity_type = "create";
    $activity->object_type = "projects";
    $activity->object_id = $project_data["id"];
    $activity->property_name = null;
    $activity->property_value = $project_data;
    $activity->author_id = hpm_user_id();
    hpm_save_activities( [$activity] );

    //////////
    // Push //
    //////////

    $pusher = hpm_get_pusher();
    $contractor_id = $project_data["contractor_id"];

    // Push to Managers & Contractor
    $channels = $contractor_id ?
        ['private-managers', 'private-contractor-'.$contractor_id] :
        'private-managers';
    $pusher->trigger($channels, 'add-project', $project_data, $socket_id);

    // Text Contractor
    hpm_send_project_assigned_notification( $contractor_id, $project_data["id"] );

}

/**
 * Update Project
 * @param  String $project_id
 * @param  Object $project_data
 * @param  String $socket_id
 */
function hpm_api_update_project( $project_id, $project_data, $socket_id ) {

    $project_data = hpm_typify_data_from_js( $project_data );

    // Secure
    $user_id = hpm_user_id();
    $role = hpm_user_role();
    $can_manage = in_array($role, ["administrator", "manager"]);

    // Fetch & Cache Old Data
    $old_contractor_id = hpm_get_project( $project_id )->contractor_id;

    // Build & Save Activities
    $activities = [];
    foreach ($project_data as $key => $value) {

        // Contractors can only modify "status".
        if ( !$can_manage &&
            (
                $key != "status" ||
                $old_contractor_id != $user_id
            ) &&
            (
                $key != "flagged"
            )
        ) { return null; }

        // Stripslahes
        if ($key == 'name') {
            $value = stripslashes( $value );
        }

        $activity = new stdClass();
        $activity->activity_type = "update";
        $activity->object_type = "projects";
        $activity->object_id = $project_id;
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
    $contractor_changed = array_key_exists( "contractor_id", $project_data );

    // Push to Managers & Same Contractor
    $push_data = [
        "id" => $project_id,
        "data" => $project_data
    ];
    $channels = $contractor_changed || !$old_contractor_id ?
        'private-managers' :
        ['private-managers', 'private-contractor-'.$old_contractor_id];
    $pusher->trigger($channels, 'update-project', $push_data, $socket_id);

    // Push to Old & New Contractors
    if ( $contractor_changed ) {

        // Remove from Old Contractor
        if ( $old_contractor_id ) {
            $push_data = $project_id;
            $pusher->trigger('private-contractor-'.$old_contractor_id, 'remove-project', $push_data, $socket_id);
        }

        // Add to New Contractor
        if ($project_data["contractor_id"]) {
            $push_data = hpm_get_project( $project_id );
            $pusher->trigger('private-contractor-' . $project_data["contractor_id"], 'add-project', $push_data, $socket_id);
        }

        // Text New Contractor
        hpm_send_project_assigned_notification( $project_data["contractor_id"], $project_id );

    }

    error_log( $project_id );

}

/**
 * Delete Project
 * @param  String $project_id
 * @param  String $socket_id
 */
function hpm_api_delete_project( $project_id, $socket_id ) {

    // Secure
    $role = hpm_user_role();
    if (!in_array($role, ["administrator", "manager"])) {
        return null;
    }

    // Fetch & Cache Project Data
    $contractor_id = hpm_get_project( $project_id )->contractor_id;

    // Build & Save Activity
    $activity = new stdClass();
    $activity->activity_type = "delete";
    $activity->object_type = "projects";
    $activity->object_id = $project_id;
    $activity->property_name = null;
    $activity->property_value = null;
    $activity->author_id = hpm_user_id();
    hpm_save_activities( [$activity] );

    //////////
    // Push //
    //////////

    $pusher = hpm_get_pusher();

    // Push to Managers & Contractor
    $channels = $contractor_id ?
        ['private-managers', 'private-contractor-'.$contractor_id] :
        'private-managers';
    $pusher->trigger($channels, 'remove-project', $project_id, $socket_id);


    // Clean Up
    global $wpdb;
    $resource_table = $wpdb->prefix . 'hpm_resources';
    $message_table = $wpdb->prefix . 'hpm_messages';
    $time_table = $wpdb->prefix . 'hpm_times';

    // Delete Resources
    $wpdb->delete(
        $resource_table,
        array(
            "project_id" => $project_id
        )
    );

    // Delete Messages
    $wpdb->delete(
        $message_table,
        array(
            "project_id" => $project_id
        )
    );

    // Delete Times
    $wpdb->delete(
        $time_table,
        array(
            "project_id" => $project_id
        )
    );

}
