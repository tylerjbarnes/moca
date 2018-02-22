<?php

/**
 * Get Static Objects from DB for Client App
 * @return Object objects
 */
function moca_client_api_objects() {

    $response = new stdClass();
    $response->profile = hpm_client_profile();
    $response->projects = hpm_client_projects();
    $response->balance = hpm_client_balance();
    $response->packages = hpm_client_packages();

    return $response;

}

/**
 * Get Profile for Client App
 * @return Object
 */
function hpm_client_profile() {
    return (object) [
        "name" => hpm_user_name()
    ];
}

/**
 * Get Projects for Client App
 * @return Array
 */
function hpm_client_projects( $type ) {

    $client_id = hpm_user_id();

    global $wpdb;
    $project_table = $wpdb->prefix . 'hpm_projects';
    $time_table = $wpdb->prefix . 'hpm_times';

    // Get Rows from DB
    $results = $wpdb->get_results(join(' ', [
        "SELECT projects.name, projects.start, times.spent, projects.archived complete",
        "FROM $project_table projects",
        "LEFT JOIN (",
            "SELECT project_id, SUM(hours) spent",
            "FROM $time_table",
            "WHERE type = 'log'",
            "GROUP BY project_id",
        ") times ON projects.id = times.project_id",
        "WHERE client_id = '$client_id';"


    ]));

    // Typify
    $typified = array_map( function( $row ) {
        return (object) [
            'name' => $row->name,
            'start' => $row->start,
            'spent' => (float) $row->spent,
            'complete' => (bool) $row->complete
        ];
    }, $results );

    return $typified;

}

/**
 * Get Balance for Client App
 * @param $client_id optional
 * @return float
 */
function hpm_client_balance( $client_id ) {
    $client_id = $client_id ? $client_id : hpm_user_id();

    global $wpdb;
    $time_table = $wpdb->prefix . 'hpm_times';

    // Get Credit Rows from DB
    $credits = (float) $wpdb->get_var(join(' ', [
        "SELECT SUM(ABS(hours))",
        "FROM $time_table",
        "WHERE client_id = '$client_id'",
        "AND type = 'purchase';"
    ]));

    // Get Debit Rows from DB
    $debits = (float) $wpdb->get_var(join(' ', [
        "SELECT SUM(ABS(hours))",
        "FROM $time_table",
        "WHERE client_id = '$client_id'",
        "AND type != 'purchase';"
    ]));

    return $credits - $debits;
}

/**
 * Get Packages for Client App
 * @return [type] [description]
 */
function hpm_client_packages() {
    $client_id = hpm_user_id();

    global $wpdb;
    $package_table = $wpdb->prefix . 'hpm_packages';
    $time_table = $wpdb->prefix . 'hpm_times';

    // Get Rows from DB
    $results = $wpdb->get_results(join(' ', [
        "SELECT packages.hours, packages.expiration_date, times.date",
        "FROM $package_table packages",
        "JOIN (",
            "SELECT package_id, date",
            "FROM $time_table",
        ") times ON times.package_id = packages.id",
        "WHERE client_id = '$client_id';"
    ]));

    // Typify
    $typified = array_map( function( $row ) {
        return (object) [
            'date' => $row->date,
            'hours' => (float) $row->hours,
            'expiration_date' => $row->expiration_date
        ];
    }, $results );

    return $typified;
}

?>
