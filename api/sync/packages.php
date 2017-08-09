<?php

//////////
// Load //
//////////

/**
 * Load Packages
 * @return Array
 */
function hpm_api_load_packages() {

    global $wpdb;
    $package_table = $wpdb->prefix . 'hpm_packages';

    $rows = $wpdb->get_results( "
        SELECT * FROM $package_table
    " );
    return array_map(function( $row ) {
        return hpm_typify_package_data( $row );
    }, $rows);

}

function hpm_typify_package_data( $row ) {
    $row->hours = (float) $row->hours;
    return $row;
}


//////////
// Sync //
//////////

/**
 * Create Package
 * @param  Object $package_data
 * @param  String $socket_id
 */
function hpm_api_create_package( $package_data, $socket_id ) {

    // Secure
    $role = hpm_user_role();
    if ( !in_array( $role, ["administrator", "manager"] ) ) {
        return;
    }

    // Build & Save Activity
    $activity = new stdClass();
    $activity->activity_type = "create";
    $activity->object_type = "packages";
    $activity->object_id = $package_data["id"];
    $activity->property_name = null;
    $activity->property_value = $package_data;
    $activity->author_id = hpm_user_id();
    hpm_save_activities( [$activity] );

    //////////
    // Push //
    //////////

    $pusher = hpm_get_pusher();

    // Push to Everyone
    $channels = ["private-managers", "contractors"];
    $pusher->trigger($channels, 'add-package', $package_data, $socket_id);

}

/**
 * Update Package
 * @param  String $package_id
 * @param  Object $package_data
 * @param  String $socket_id
 */
function hpm_api_update_package( $package_id, $package_data, $socket_id ) {

    // Secure
    $role = hpm_user_role();
    if ( !in_array( $role, ["administrator", "manager"] ) ) {
        return;
    }

    // Build & Save Activities
    $activities = [];
    foreach ($package_data as $key => $value) {
        $activity = new stdClass();
        $activity->activity_type = "update";
        $activity->object_type = "packages";
        $activity->object_id = $package_id;
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
        "id" => $package_id,
        "data" => $package_data
    ];

    // Push to Everyone
    $channels = ["private-managers", "contractors"];
    $pusher->trigger($channels, 'update-package', $push_data, $socket_id);

}

/**
 * Delete Package
 * @param  String $package_id
 * @param  String $socket_id
 */
function hpm_api_delete_package( $package_id, $socket_id ) {

    // Secure
    $role = hpm_user_role();
    if ( !in_array( $role, ["administrator", "manager"] ) ) {
        return;
    }

    // Build & Save Activity
    $activity = new stdClass();
    $activity->activity_type = "delete";
    $activity->object_type = "packages";
    $activity->object_id = $package_id;
    $activity->property_name = null;
    $activity->property_value = null;
    $activity->author_id = hpm_user_id();
    hpm_save_activities( [$activity] );

    //////////
    // Push //
    //////////

    $pusher = hpm_get_pusher();

    // Push to Everyone
    $channels = ["private-managers", "contractors"];
    $pusher->trigger($channels, 'remove-package', $package_id, $socket_id);

}
