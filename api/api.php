<?php

require 'lib/Cuid.php';
require 'functions.php';

// require 'front_load.php';
// require 'lazy_load.php';

// require 'sync/activity.php';
// require 'sync/projects.php';
// require 'sync/persons.php';
// require 'sync/times.php';
// require 'sync/resources.php';
// require 'sync/files.php';
// require 'sync/messages.php';
// require 'sync/packages.php';


/////////////
// Objects //
/////////////

/**
 * Get Static Objects from DB
 * @return Object objects & last mutation id
 */
function hpm_api_objects() {

    $response = new stdClass();

    $response->messages = hpm_objects('message');
    $response->packages = hpm_objects('package');
    $response->persons = hpm_persons();
    $response->projects = hpm_objects('project');
    $response->resources = hpm_objects('resource');
    $response->times = hpm_objects('time');

    $response->last_mutation_id = hpm_last_mutation_id();

    return $response;

}

/**
 * Get Static Objects of Type
 * @param  String $type
 * @return Array
 */
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

/**
 * Attach Avatar URL to Person Row
 * @param  Object $row
 * @return Object
 */
function hpm_attach_avatar( $row ) {
    $row->avatar = get_wp_user_avatar_src( $row->wp_id, 'thumbnail');
    return $row;
}

/**
 * Get Static Persons
 * @return Array
 */
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


///////////////
// Mutations //
///////////////

/**
 * Get the Last Mutation ID in the DB
 * @return Int
 */
function hpm_last_mutation_id () {

    global $wpdb;
    $table = $wpdb->prefix . 'hpm_mutations';
    $result = $wpdb->get_var( "SELECT id FROM $table ORDER BY id DESC LIMIT 1" );
    return (int) $result;

}

/**
 * Get Mutations Since a Given Mutation ID
 * @param  integer $last_mutation_id
 * @return Object  mutations & new last id
 */
function hpm_api_mutations ( $last_mutation_id = 0 ) {

    $user_id = hpm_user_id();
    $user_role = hpm_user_role();

    global $wpdb;
    $table = $wpdb->prefix . 'hpm_mutations';
    $results = $wpdb->get_results( "SELECT * FROM $table WHERE id > $last_mutation_id" );
    $mutations = array_map(function($row){
        return hpm_typify_data_from_db( $row );
    }, $results);

    $response = new stdClass();
    $response->mutations = $mutations;
    $response->last_mutation_id = hpm_last_mutation_id();
    return $response;

}

/**
 * Mutate an Object
 * @param  Array $mutations
 * @param  String $socket_id
 * @return Object response with new last id
 */
function hpm_api_mutate ( $mutations, $socket_id ) {

    global $wpdb;

    // Apply Mutations
    foreach( $mutations as $mutation ) {
        $table = $wpdb->prefix . 'hpm_' . $mutation->object_type . 's';
        $mutation->datetime = gmdate("Y-m-d H:i:s");
        $mutation->property_name = $mutation->property_name ? $mutation->property_name : NULL;
        switch ( $mutation->action ) {
            case "create": $wpdb->insert( $table, (array) $mutation->property_value ); break;
            case "update": $wpdb->update( $table, [ $mutation->property_name => $mutation->property_value ],
                [ "id" => $mutation->object_id ] ); break;
            case "delete": $wpdb->delete( $table, [ 'id' => $mutation->object_id ] ); break;
            default: break;
        }
    }

    // Store Mutations
    $table = $wpdb->prefix . "hpm_mutations";
    foreach( $mutations as $mutation ) {
        $flattened_mutation = clone $mutation;
        $flattened_mutation->property_value = json_encode( $flattened_mutation->property_value );
        $wpdb->insert( $table, (array) $flattened_mutation, array("%s","%s","%s","%s","%s","%s") );
    }
    $last_mutation_id = $wpdb->insert_id;

    // Push Mutations
    $pusher = hpm_get_pusher();
    $data = (object) ['mutations' => $mutations, 'last_mutation_id' => $last_mutation_id];
    $pusher->trigger('members', 'mutate', $data, $socket_id);

    // Respond
    $response = new stdClass();
    $response->last_mutation_id = $last_mutation_id;
    return $response;

}


/////////////////
// Data Typing //
/////////////////

/**
 * Restore Types Accessed from DB
 * @param  Object $data
 * @return Object type-restored object
 */
function hpm_typify_data_from_db( $data ) {
    $typified = new stdClass();

    foreach ($data as $key => $value) {
        if ($value == "" && in_array($key,[
            'property_name',
            'parent_id',
            'author_id',
            'project_id',
            'client_id',
            'meta',
            'wp_id',
            'cell_provider',
            'cell_number',
            'target',
            'due',
            'max',
            'autocycle',
            'contractor_id',
            'manager_id',
            'worker_id',
            'cycle',
            'package_id'
        ])) { $typified->$key = NULL; } else {
            switch ($key) {
                case 'archived':
                case 'flagged':
                case 'pending':
                case 'resolved':
                    $typified->$key = $value == 1;
                    break;
                case 'avatar':
                    $typified->$key = get_wp_user_avatar_src( $data->wp_id, 'thumbnail');
                    break;
                case 'content':
                case 'memo':
                case 'name':
                    $typified->$key = stripslashes( $value );
                    break;
                case 'cycle':
                case 'time_offset':
                    $typified->$key = (int) $value;
                    break;
                case 'estimate':
                case 'hours':
                case 'max':
                case 'notification_time':
                    $typified->$key = abs((float) $value);
                    break;
                case 'meta':
                    $typified->$key = json_decode( $value );
                    break;
                case 'property_value':
                    $first_char = substr($value, 0, 1);
                    if ( $first_char === '{' || $first_char === '[' ) {
                        $typified->$key = hpm_typify_data_from_db( json_decode( $value ) );
                    } else {
                        $typified->$key = $value;
                    }
                    break;
                default:
                    $typified->$key = $value;
                    break;
            }
        }
    }

    return $typified;
}

/**
 * Restore Types Sent from JS
 * @param  Object $data
 * @return Object type-restored object
 */
function hpm_typify_data_from_js( $data ) {
    $typified = [];

    foreach ($data as $key => $value) {
        switch ($key) {
            case 'archived':
            case 'flagged':
            case 'pending':
            case 'resolved':
                $typified[$key] = $value == 'true';
                break;
            case 'cycle':
            case 'time_offset':
                $typified[$key] = (int) $value;
                break;
            case 'estimate':
            case 'hours':
            case 'max':
            case 'notification_time':
                $typified[$key] = abs((float) $value);
                if (array_key_exists('type', $data) && $data['type'] !== 'purchase') {
                    $typified[$key] = $typified[$key] * -1;
                }
                break;
            default:
                $typified[$key] = $value;
                break;
        }
    }

    return $typified;
}
