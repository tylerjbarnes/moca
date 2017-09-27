<?php

////////////
// Create //
////////////



//////////
// Read //
//////////

function hpm_attach_avatar( $row ) {
    $row->avatar = get_wp_user_avatar_src( $row->wp_id, 'thumbnail');
    return $row;
}

function moca_get_persons () {

    global $wpdb;
    $person_table = $wpdb->prefix . 'hpm_persons';
    $times_table = $wpdb->prefix . 'hpm_times';

    // Clients

    // SELECT persons.*, SUM(time.hours) balance
    $query = "
        SELECT persons.*
        FROM $person_table persons
        LEFT JOIN $times_table time
            ON persons.id = time.client_id
        WHERE role = 'client'
        GROUP BY persons.id;
    ";
    $clients_data = $wpdb->get_results( $query );

    // Non-Clients
    $query = "
        SELECT *
        FROM $person_table
        WHERE role != 'client';
    ";
    $others_data = $wpdb->get_results( $query );

    // Combine
    $persons_data = array_merge( $clients_data, $others_data );

    // Avatars
    $persons_data = array_map( function($datum) {
        return hpm_typify_data_from_db( hpm_attach_avatar( $datum ) );
    }, $persons_data );

    // Return
    return $persons_data;

}





















// //////////
// // Load //
// //////////
//
// /**
//  * Load Person
//  * @param  String $id
//  * @return Object person data
//  */
// function hpm_api_load_person( $id ) {
//
//     global $wpdb;
//     $person_table = $wpdb->prefix . 'hpm_persons';
//     $times_table = $wpdb->prefix . 'hpm_times';
//
//     // Query
//     $query = "
//         SELECT persons.*, SUM(time.hours) balance
//         FROM $person_table persons
//         LEFT JOIN $times_table time
//             ON persons.id = time.client_id
//         WHERE persons.id = '$id'
//     ";
//     $person_data = $wpdb->get_row( $query );
//
//     // // Avatar
//     // $person_data->avatar = get_wp_user_avatar_src( $datum->wp_id, 'thumbnail');
//
//     // Return
//     return hpm_typify_data_from_db( hpm_attach_avatar( $person_data ) );
//
// }
//
// /**
//  * Load Persons
//  * @return Array
//  */
// function hpm_api_load_persons($filters = []) {
//
//     global $wpdb;
//     $person_table = $wpdb->prefix . 'hpm_persons';
//     $times_table = $wpdb->prefix . 'hpm_times';
//
//     // Filter
//     foreach( $filters as $key=>$value ) {
//         if ($value == "true") { $value = 1; }
//         if ($value == "false") { $value = 0; }
//         $where .= " AND $key = '$value'";
//     }
//
//     // Clients
//
//     // SELECT persons.*, SUM(time.hours) balance
//     $query = "
//         SELECT persons.*
//         FROM $person_table persons
//         LEFT JOIN $times_table time
//             ON persons.id = time.client_id
//         WHERE role = 'client' $where
//         GROUP BY persons.id;
//     ";
//     $clients_data = $wpdb->get_results( $query );
//
//     // Non-Clients
//     $query = "
//         SELECT *
//         FROM $person_table
//         WHERE role != 'client' $where;
//     ";
//     $others_data = $wpdb->get_results( $query );
//
//     // Combine
//     $persons_data = array_merge( $clients_data, $others_data );
//
//     // Avatars
//     $persons_data = array_map( function($datum) {
//         return hpm_typify_data_from_db( hpm_attach_avatar( $datum ) );
//     }, $persons_data );
//
//     // Return
//     return $persons_data;
//
// }



//////////
// Sync //
//////////

/**
 * Create Person
 * @param  Object $person_data
 * @param  String $socket_id
 */
function hpm_api_create_person( $person_data, $socket_id ) {

    $person_data = hpm_typify_data_from_js( $person_data );

    // Secure
    $role = hpm_user_role();
    if (!in_array($role, ["administrator", "manager"])) {
        return null;
    }

    // // Bail if Exists
    // if ( username_exists( $person_data["name"] ) ) {
    //     return;
    // }

    // // Create WP User
    // $username = $person_data["name"];
    // $password = wp_generate_password( 12, false );
    // $wp_id = wp_create_user( $username, $password );
    // $user = new WP_User( $wp_id );
    // $user->set_role( $person_data["role"] );
    // $person_data["wp_id"] = $wp_id;

    // Build & Save Activity
    $activity = new stdClass();
    $activity->activity_type = "create";
    $activity->object_type = "persons";
    $activity->object_id = $person_data["id"];
    $activity->property_name = null;
    $activity->property_value = $person_data;
    $activity->author_id = hpm_user_id();
    hpm_save_activities( [$activity] );

    // Push
    $pusher = hpm_get_pusher();
    $channels = ['private-managers', 'contractors'];
    $pusher->trigger($channels, 'add-person', $person_data, $socket_id);

}

/**
 * Update Person
 * @param  String $person_id
 * @param  Object $person_data
 * @param  String $socket_id
 */
function hpm_api_update_person( $person_id, $person_data, $socket_id ) {

    $person_data = hpm_typify_data_from_js( $person_data );

    // Secure
    $role = hpm_user_role();
    if (!in_array($role, ["administrator", "manager"])) {
        return null;
    }

    // Build & Save Activities
    $activities = [];
    foreach ($person_data as $key => $value) {
        $activity = new stdClass();
        $activity->activity_type = "update";
        $activity->object_type = "persons";
        $activity->object_id = $person_id;
        $activity->property_name = $key;
        $activity->property_value = $value;
        $activity->author_id = hpm_user_id();
        $activities[] = $activity;
    }
    hpm_save_activities( $activities );

    // Push
    $pusher = hpm_get_pusher();
    $push_data = [
        "id" => $person_id,
        "data" => $person_data
    ];
    $channels = ['private-managers', 'contractors'];
    $pusher->trigger($channels, 'update-person', $push_data, $socket_id);

}

/**
 * Delete Person
 * @param  String $person_id
 * @param  String $socket_id
 */
function hpm_api_delete_person( $person_id, $socket_id ) {

    // Secure
    $role = hpm_user_role();
    if (!in_array($role, ["administrator", "manager"])) {
        return null;
    }

    // Delete WP User
    $wp_id = intval( hpm_get_person( $person_id )->wp_id );
    require_once(ABSPATH.'wp-admin/includes/user.php');
    wp_delete_user( $wp_id );

    // Build & Save Activity
    $activity = new stdClass();
    $activity->activity_type = "delete";
    $activity->object_type = "persons";
    $activity->object_id = $person_id;
    $activity->property_name = null;
    $activity->property_value = null;
    $activity->author_id = hpm_user_id();
    hpm_save_activities( [$activity] );

    // Push
    $pusher = hpm_get_pusher();
    $channels = ['private-managers', 'contractors'];
    $pusher->trigger($channels, 'remove-person', $person_id, $socket_id);

}


/////////////
// Profile //
/////////////

/**
 * Update Profile
 * @param  String $person_id
 * @param  Object $person_data
 * @param  String $socket_id
 */
function hpm_api_update_profile( $person_id, $person_data, $socket_id ) {

    // Secure
    $user_id = hpm_user_id();
    if (!in_array($role, ["administrator", "manager"]) &&
        $user_id != $person_id) {
        return null;
    }

    // Build & Save Activities
    $activities = [];
    foreach ($person_data as $key => $value) {
        $activity = new stdClass();
        $activity->activity_type = "update";
        $activity->object_type = "persons";
        $activity->object_id = $person_id;
        $activity->property_name = $key;
        $activity->property_value = $value;
        $activity->author_id = hpm_user_id();
        $activities[] = $activity;
    }
    hpm_save_activities( $activities );

    // Push
    $pusher = hpm_get_pusher();
    $push_data = [
        "id" => $person_id,
        "data" => $person_data
    ];
    $channels = ['private-managers', 'contractors'];
    $pusher->trigger($channels, 'update-person', $push_data, $socket_id);

}
