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
