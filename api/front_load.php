<?php

/**
 * Load Profile Data
 * @return Object profile data
 */
function hpm_load_profile() {

    $wp_id = get_current_user_id();

    global $wpdb;
    $person_table = $wpdb->prefix . 'hpm_persons';
    $profile_data = $wpdb->get_row( "SELECT * FROM $person_table WHERE wp_id = $wp_id" );

    return $profile_data;

}

/**
 * Load App Data from DB
 * @return Object app data
 */
function hpm_api_load() {

    $response = new stdClass();
    $response->profile = hpm_load_profile();
    $response->persons = hpm_api_load_persons([
        // "archived" => "false"
    ]);
    $response->projects = hpm_api_load_projects([
        "archived" => "false"
    ]);
    $response->times = hpm_api_load_times([
        // "archived" => "false"
    ]);
    $response->resources = hpm_api_load_resources([
        // "archived" => "false"
    ]);
    $response->messages = hpm_api_load_messages([
        // "archived" => "false"
    ]);
    $response->packages = hpm_api_load_packages();
    return $response;
}


// start new moca version


/**
 * Download Static App Data from DB
 * @return Object app data
 */
function hpm_api_objects() {

    $response = new stdClass();

    $response->messages = [];
    $response->packages = [];
    $response->persons = hpm_persons();
    $response->projects = hpm_objects('project');
    $response->resources = [];
    $response->times = [];

    $response->last_mutation_id = hpm_last_mutation_id();

    return $response;

}

function hpm_objects( $type ) {

    global $wpdb;
    $table = $wpdb->prefix . 'hpm_' . $type . 's';
    $results = $wpdb->get_results(
        "SELECT * FROM $table"
    );
    return array_map( function( $result ) {
        return hpm_typify_data_from_db( $result );
    }, $results );

}

function hpm_persons () {

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
