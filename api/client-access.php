<?php
function projectSorter($a, $b){
    if( $a->status != $b->status ) {
        return $a->status > $b->status;
    } else {
        return $a->start < $b->start;
    }
}

function hpm_client_data() {
    global $wpdb;
    $project_table = $wpdb->prefix . 'hpm_projects';
    $packages_table = $wpdb->prefix . 'hpm_packages';
    $time_table = $wpdb->prefix . 'hpm_times';

    $client_id = hpm_user_id();
    $projects = $wpdb->get_results( "
        SELECT * FROM $project_table
        WHERE client_id = '$client_id'
    " );
    $packages = $wpdb->get_results( "
        SELECT * FROM $packages_table
        WHERE client_id = '$client_id'
    " );
    $balance = $wpdb->get_var("
        SELECT sum(hours) FROM $time_table
        WHERE client_id = '$client_id'
    ");

    $project_data = array_map( function( $project ){

        $datum = new stdClass();

        $datum->name = $project->name;
        $datum->start = $project->start;
        $datum->status = $project->archived ? "Complete" : "Active";

        global $wpdb;
        $time_table = $wpdb->prefix . 'hpm_times';
        $datum->hours = $wpdb->get_var( "
            SELECT sum(hours) FROM $time_table
            WHERE project_id = '$project->id'
        " );

        return $datum;
    }, $projects );

    usort($project_data, "projectSorter");

    $credit_data = array_map( function( $package ) {

        $datum = new stdClass();
        $datum->hours = $package->hours;
        $datum->expiration_date = $package->expiration_date;

        global $wpdb;
        $time_table = $wpdb->prefix . 'hpm_times';
        $time = $wpdb->get_row("
            SELECT * from $time_table
            WHERE package_id = '$package->id'
            AND type = 'credit'
        ");
        $datum->date = $time ? $time->date : NULL;

        return $datum;

    }, $packages);

    $response = new stdClass();
    $response->projects = $project_data;
    $response->credits = $credit_data;
    $response->balance = $balance;

    return $response;
}
