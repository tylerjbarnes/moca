<?php

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
        $mutation->property_value = json_encode( $mutation->property_value );
        $wpdb->insert( $table, (array) $mutation, array("%s","%s","%s","%s","%s","%s") );
    }

    // Push Mutations

    // Respond
    $response = new stdClass();
    $response->last_mutation_id = $wpdb->insert_id;
    return $response;

}

function hpm_last_mutation_id () {

    global $wpdb;
    $table = $wpdb->prefix . 'hpm_mutations';
    $result = $wpdb->get_var( "SELECT id FROM $table ORDER BY id DESC LIMIT 1" );
    return (int) $result;

}













/**
 * Perform and Log Activity
 * @param  Activity $activity
 * @return Activity now with id and timestamp
 */
function hpm_save_activity( $activity ) {

    global $wpdb;

    // Do Activity
    $table = $wpdb->prefix . "hpm_" . $activity->object_type;
    switch ( $activity->activity_type ) {

        case "update":
            $wpdb->update(
                $table,
                [ $activity->property_name => $activity->property_value ],
                [ "id" => $activity->object_id ]
            );
            break;

        case "create":
            // Message TimeZone
            if ( $activity->object_type == "messages" ) {
                $activity->property_value["datetime"] = gmdate("Y-m-d H:i:s");
            }

            $wpdb->insert(
                $table,
                $activity->property_value
            );
            $activity->property_value = json_encode($activity->property_value);
            break;

        case "delete":
            $wpdb->delete( $table, array( 'id' => $activity->object_id ) );
            break;

        default:
            break;

    }

    // Log Activity
    $table = $wpdb->prefix . "hpm_activity";
    // Activity TimeZone
    $activity->datetime = gmdate("Y-m-d H:i:s");
    $wpdb->insert(
        $table,
        (array) $activity,
        array("%s","%s","%s","%s","%s","%s")
    );

}

/**
 * Perform and Log Activities
 * @param  Array $activities
 */
function hpm_save_activities( $activities ) {
    foreach ($activities as $activity) {
        hpm_save_activity( $activity );
    }
}


function hpm_api_create_object( $type, $data, $socket_id ) {
    foreach ($data as $key => $value) {
        $data[$key] = $value !== '' ? $value : NULL;
    }
    $function_name = 'hpm_api_create_' . $type;
    $function_name( $data, $socket_id );
}

function hpm_api_modify_object( $type, $id, $data, $socket_id ) {
    foreach ($data as $key => $value) {
        $data[$key] = $value !== '' ? $value : NULL;
    }
    $function_name = 'hpm_api_update_' . $type;
    $function_name( $id, $data, $socket_id );
}

function hpm_api_delete_object( $id, $socket_id ) {
    $function_name = 'hpm_api_delete_' . $type;
    $function_name( $id, $socket_id );
}



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
