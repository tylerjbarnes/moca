<?php
// @todo



// /**
//  * Load Person
//  * @param  String $id
//  * @return Object person data
//  */
// function hpm_api_load_person($id) {
//
//     // @todo: untested
//
//     global $wpdb;
//     $person_table = $wpdb->prefix . 'hpm_persons';
//     $times_table = $wpdb->prefix . 'hpm_times';
//
//     $person_data = $wpdb->get_row( "
//         SELECT persons.*, SUM(times.hours)
//         LEFT JOIN $times_table ON persons.id = times.client_id
//         FROM $person_table
//         WHERE id = '$id'
//     " );
//     return $person_data;
//
// }
