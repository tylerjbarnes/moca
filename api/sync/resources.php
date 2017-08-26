<?php

//////////
// Load //
//////////

/**
 * Load Resources
 * @return Array
 */
function hpm_api_load_resources($filters = []) {

    $user_id = hpm_user_id();
    $user_role = hpm_user_role();

    global $wpdb;
    $resource_table = $wpdb->prefix . 'hpm_resources';
    $project_table = $wpdb->prefix . 'hpm_projects';
    $where = "WHERE 1 = 1";

    // Secure
    switch ($user_role) {

        case "administrator":
        case "manager":
            break;

        case "contractor":
            $where .= " AND (projects.contractor_id = '$user_id' OR resources.project_id IS NULL)";
            break;

        default:
            return null;

    }

    // Filter
    foreach( $filters as $key=>$value ) {

        switch ($key) {
            case "archived":
                $value = $value == "true" ? 1 : 0;
                $where .= " AND projects.archived = $value";
                break;

            default:
                $where .= " AND $key = '$value'";
        }

    }

    // Fetch
    $flat_resources = $wpdb->get_results( "
    SELECT resources.* FROM $resource_table resources
    LEFT JOIN $project_table projects ON resources.project_id = projects.id
    $where
    " );

    // Prepare & Return
    return array_map( function( $resource ) {
        return hpm_typify_data_from_db( $resource );
    }, $flat_resources);

}


//////////
// Sync //
//////////

/**
 * Create Resource
 * @param  Object $resource_data
 * @param  String $socket_id
 */
function hpm_api_create_resource( $resource_data, $socket_id ) {

    $resource_data = hpm_typify_data_from_js( $resource_data );

    // Fetch & Cache Resource's Project's Contractor
    $contractor_id = null;
    if ( $resource_data["project_id"] ) {
        $project = hpm_get_project( $resource_data["project_id"] );
        $contractor_id = $project->contractor_id;
    }

    // Secure
    $user_id = hpm_user_id();
    $role = hpm_user_role();
    if ( !in_array( $role, ["administrator", "manager"] )
        && $user_id != $contractor_id ) {
        return;
    }

    // Prepare Content JSON
    $flattened_resource_data = $resource_data;
    $flattened_resource_data["content"] = json_encode( $flattened_resource_data["content"] );

    // Build & Save Activity
    $activity = new stdClass();
    $activity->activity_type = "create";
    $activity->object_type = "resources";
    $activity->object_id = $resource_data["id"];
    $activity->property_name = null;
    $activity->property_value = $flattened_resource_data;
    $activity->author_id = hpm_user_id();
    hpm_save_activities( [$activity] );

    //////////
    // Push //
    //////////

    // Strip Slashes
    $resource_data["content"]["body"] = stripslashes( $resource_data["content"]["body"] );
    if ( $resource_data["name"] ) {
        $resource_data["name"] = stripslashes( $resource_data["name"] );
    }

    $pusher = hpm_get_pusher();

    // Push to Managers
    $pusher->trigger('private-managers', 'add-resource', $resource_data, $socket_id);

    // Push to Contractor
    if ( $contractor_id ) {
        $pusher->trigger('private-contractor-'.$contractor_id, 'add-resource', $resource_data, $socket_id);
    } else {
        $pusher->trigger('contractors', 'add-resource', $resource_data, $socket_id);
    }

}

/**
 * Update Resource
 * @param  String $resource_id
 * @param  Object $resource_data
 * @param  String $socket_id
 */
function hpm_api_update_resource( $resource_id, $resource_data, $socket_id ) {

    $resource_data = hpm_typify_data_from_js( $resource_data );

    // Fetch & Cache Resource's Project's Contractor
    $contractor_id = null;
    $project = null;
    if ( $resource_data["project_id"] ) {
        $project = hpm_get_project( $resource_data["project_id"] );
    } else {
        $resource = hpm_get_resource( $resource_id );
        $project = hpm_get_project( $resource->project_id );
    }
    if ($project) {
        $contractor_id = $project->contractor_id;
    }

    // Secure
    $user_id = hpm_user_id();
    $role = hpm_user_role();
    if ( !in_array( $role, ["administrator", "manager"] )
        && $user_id != $contractor_id ) {
        return;
    }

    // Build & Save Activities
    $activities = [];
    foreach ($resource_data as $key => $value) {

        // Prepare Content JSON
        if ($key == "content") {
            $value = json_encode( $value );
        }

        $activity = new stdClass();
        $activity->activity_type = "update";
        $activity->object_type = "resources";
        $activity->object_id = $resource_id;
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
    $resource_data["content"]["body"] = stripslashes( $resource_data["content"]["body"] );
    if ( $resource_data["name"] ) {
        $resource_data["name"] = stripslashes( $resource_data["name"] );
    }

    $pusher = hpm_get_pusher();
    $push_data = [
        "id" => $resource_id,
        "data" => $resource_data
    ];

    // Push to Managers
    $pusher->trigger('private-managers', 'update-resource', $push_data, $socket_id);

    // Push to Contractor
    if ( $contractor_id ) {
        $pusher->trigger('private-contractor-'.$contractor_id, 'update-resource', $push_data, $socket_id);
    } else {
        $pusher->trigger('contractors', 'update-resource', $push_data, $socket_id);
    }

}

/**
 * Delete Resource
 * @param  String $resource_id
 * @param  String $socket_id
 */
function hpm_api_delete_resource( $resource_id, $socket_id ) {

    // Fetch & Cache Resource's Project's Contractor
    $contractor_id = null;
    $resource = hpm_get_resource( $resource_id );
    $project = hpm_get_project( $resource->project_id );
    if ($project) {
        $contractor_id = $project->contractor_id;
    }

    // Secure
    $user_id = hpm_user_id();
    $role = hpm_user_role();
    if ( !in_array( $role, ["administrator", "manager"] )
        && $user_id != $contractor_id ) {
        return;
    }

    // Build & Save Activity
    $activity = new stdClass();
    $activity->activity_type = "delete";
    $activity->object_type = "resources";
    $activity->object_id = $resource_id;
    $activity->property_name = null;
    $activity->property_value = null;
    $activity->author_id = hpm_user_id();
    hpm_save_activities( [$activity] );

    //////////
    // Push //
    //////////

    $pusher = hpm_get_pusher();

    // Push to Managers
    $pusher->trigger('private-managers', 'remove-resource', $resource_id, $socket_id);

    // Push to Contractor
    if ( $contractor_id ) {
        $pusher->trigger('private-contractor-'.$contractor_id, 'remove-resource', $resource_id, $socket_id);
    } else {
        $pusher->trigger('contractors', 'remove-resource', $resource_id, $socket_id);
    }

}
