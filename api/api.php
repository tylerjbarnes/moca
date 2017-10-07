<?php

require 'lib/Cuid.php';
require 'functions.php';


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
    $response->persons = hpm_objects('person');
    $response->projects = hpm_objects('project');
    $response->resources = hpm_objects('resource');
    $response->times = hpm_objects('time');

    $response->last_mutation_id = hpm_last_mutation_id();

    return $response;

}

/**
 * Attach Avatar URL to Person Primitive
 * @param  Object $primitive
 * @return Object
 */
function hpm_attach_avatar( $primitive ) {
    $primitive->avatar = get_wp_user_avatar_src( $primitive->wp_id, 'thumbnail');
    return $primitive;
}

/**
 * Get Static Objects of Type
 * @param  String $type
 * @return Array
 */
function hpm_objects( $type ) {

    global $wpdb;
    $table = $wpdb->prefix . 'hpm_' . $type . 's';

    // Limit Access for Contractors
    $where = '';
    $user_id = hpm_user_id();
    if (hpm_user_role() == 'contractor') {
        switch ( $type ) {
            case 'message':
            case 'resource':
                $project_table = $wpdb->prefix . 'hpm_projects';
                $where = "
                    LEFT JOIN (
                        SELECT id, contractor_id
                        FROM $project_table
                    ) projects on main.project_id = projects.id
                    WHERE projects.contractor_id = '$user_id'
                    OR main.project_id IS NULL
                ";
                break;
            case 'package': $where = "WHERE 0 = 1"; break;
            case 'project':
                $where = "WHERE contractor_id = '$user_id'";
                break;
            case 'time':
                $where = "WHERE worker_id = '$user_id'";
                break;
            default: break;
        }
    }

    // Get Rows from DB
    $results = $wpdb->get_results( "SELECT main.* FROM $table main $where;" );

    // Typify into Primitives
    $primitives = array_map( function( $result ) {
        return hpm_typify_data_from_db( $result );
    }, $results );

    // Add Type-Specific Transformations
    switch ( $type ) {
        case 'person':
            return array_map( function( $primitive ) {
                return hpm_attach_avatar( $primitive );
            }, $primitives );
            break;
        default:
            return $primitives;
            break;
    }

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

    global $wpdb;
    $table = $wpdb->prefix . 'hpm_mutations';
    $messages_table = $wpdb->prefix . 'hpm_messages';
    $persons_table = $wpdb->prefix . 'hpm_persons';
    $projects_table = $wpdb->prefix . 'hpm_projects';
    $resources_table = $wpdb->prefix . 'hpm_resources';
    $times_table = $wpdb->prefix . 'hpm_times';

    // Limit Access for Contractors
    $where = 'WHERE 1 = 1';
    $user_id = hpm_user_id();
    if ( hpm_user_role() == 'contractor' ) {
        $where = "JOIN (
            # object id for MPRT associated by project
            SELECT object_id
            FROM (
                # object_id -> contractor_id for messages, projects, resources
            	SELECT object_id, contractor_id
                FROM (
                    # object_id -> project_id for messages, projects, resources
                    SELECT id object_id, project_id FROM $messages_table
                    UNION ALL
                    SELECT id object_id, id project_id FROM $projects_table
                    UNION ALL
                    SELECT id object_id, project_id FROM $resources_table
                ) mesProjRes
                LEFT JOIN (
                    SELECT id, contractor_id
                    FROM $projects_table
                ) mprProj on mesProjRes.project_id = mprProj.id

                UNION ALL

                # object_id -> contractor_id for times
                SELECT id object_id, worker_id contractor_id FROM $times_table
            ) associated
            WHERE contractor_id = '$user_id'

            UNION ALL

            # object id for all persons
            SELECT id object_id FROM $persons_table

            UNION ALL

            # object id for all non-project resources
            SELECT id object_id FROM (
            	SELECT * FROM $resources_table WHERE project_id IS NULL
            ) projectlessResources

        ) valid_objects on main.object_id = valid_objects.object_id";
    }

    // Get Rows from DB
    $results = $wpdb->get_results( "SELECT * FROM $table main $where AND main.id > $last_mutation_id" );

    // Typify Mutations
    $mutations = array_map(function($row){
        return hpm_typify_data_from_db( $row );
    }, $results);

    $response = new stdClass();
    $response->mutations = $mutations;
    $response->mutation_id = hpm_last_mutation_id();
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
    $previous_mutation_id = hpm_user_last_mutation_id();

    // Restrict Mutations
    if ( hpm_user_role() == 'contractor' ) {
        foreach( $mutations as $mutation ) {
            switch ( $mutation->object_type ) {
                case 'message':
                    $valid_create = $mutation->action == 'create' && (
                        $mutation->property_value->author_id == hpm_user_id() ||
                        $mutation->property_value->author_id == NULL
                    );
                    $valid_resolve = $mutation->action == 'update' && $mutation->property_name == 'resolved';
                    if ( !$valid_create && !$valid_resolve ) { return; }
                    break;
                case 'package':
                    return;
                case 'person':
                    if (
                        $mutation->action !== 'update' ||
                        $mutation->object_id !== hpm_user_id() ||
                        !in_array( $mutation->property_name,
                            ['color', 'time_offset', 'cell_provider', 'cell_number', 'notification_time']
                        )
                    ) { return; }
                    break;
                case 'project':
                    $project = hpm_object( 'project', $mutation->object_id );
                    if (
                        $mutation->action !== 'update' ||
                        $project->contractor_id !== hpm_user_id() ||
                        $mutation->property_name !== 'status' ||
                        $mutation->property_value !== 'approve'
                    ) { return; }
                    break;
                case 'resource':
                    if ( !in_array( $mutation->action, ['create', 'update'] ) ) { return; }
                    break;
                case 'time':
                    if ( !in_array( $mutation->action, ['create', 'update'] ) ) { return; }
                    break;
                default: break;
            }
        }
    }

    // Apply Mutations
    foreach( $mutations as $mutation ) {
        $table = $wpdb->prefix . 'hpm_' . $mutation->object_type . 's';
        $mutation->datetime = gmdate("Y-m-d H:i:s");
        $mutation->property_name = $mutation->property_name ? $mutation->property_name : NULL;
        switch ( $mutation->action ) {
            case "create": $wpdb->insert( $table, (array) hpm_flatten_properties_for_db( $mutation->property_value ) ); break;
            case "update": $wpdb->update( $table, [ $mutation->property_name => hpm_flatten_data_for_db( $mutation->property_value ) ],
                [ "id" => $mutation->object_id ] ); break;
            case "delete":
                hpm_cleanup_object( $mutation->object_type, $mutation->object_id );
                $wpdb->delete( $table, [ 'id' => $mutation->object_id ] );
                break;
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
    $mutation_id = $wpdb->insert_id;

    // Push Mutations
    $pusher = hpm_get_pusher();
    $data = (object) ['mutations' => $mutations, 'mutation_id' => $mutation_id, 'integrity' => hpm_last_mutation_ids()];
    $channels = hpm_channels( $mutations );
    hpm_set_last_mutation_ids( $channels, $mutation_id );
    $pusher->trigger($channels, 'mutate', $data, $socket_id);

    // Respond
    $response = new stdClass();
    $response->mutation_id = $mutation_id;
    $response->integrity = $previous_mutation_id;
    return $response;

}

/**
 * Get Last Mutation IDs Per Person from DB
 * @return Object
 */
function hpm_last_mutation_ids() {
    global $wpdb;
    $table = $wpdb->prefix . 'hpm_persons';
    $results = $wpdb->get_results( "SELECT id, last_mutation_id FROM $table WHERE role != 'client';" );
    $arr = [];
    foreach ($results as $result) {
        $arr[$result->id] = $result->last_mutation_id;
    }
    return (object) $arr;
}

/**
 * Record Last Mutation IDs Per Person in DB
 * @param Array $channels
 * @param Int $mutation_id
 */
function hpm_set_last_mutation_ids( $channels, $mutation_id ) {
    if ( in_array( 'members', $channels ) ) {
        $where = '';
    } else {
        $channel = array_values ( array_filter( $channels, function( $channel ) {
            return $channel != 'private-managers';
        }))[0];
        $user_id = explode( '-', $channel )[2];
        $where = "WHERE role = 'manager' OR role = 'administrator' OR id = '$user_id'";
    }
    global $wpdb;
    $table = $wpdb->prefix . 'hpm_persons';
    $wpdb->query( "UPDATE $table SET last_mutation_id = $mutation_id $where;" );
}

/**
 * Get Valid Channels to Push Mutations
 * @param  Array $mutations
 * @return Array
 */
function hpm_channels( $mutations ) {
    $mutation = $mutations[0];
    $object = hpm_object( $mutation->object_type, $mutation->object_id );
    $channels = [];
    switch ($mutation->object_type) {
        case 'message':
        case 'resource':
            if ( $object->project_id === NULL ) {
                $channels = ['members'];
            } else {
                $channels[] = 'private-managers';
                $project = hpm_object( 'project', $object->project_id );
                if ( $project->contractor_id !== NULL ) {
                    $channels[] = 'private-contractor-' . $project->contractor_id;
                }
            }
            break;
        case 'package':
            $channels = ['private-managers'];
            break;
        case 'person':
        case 'project':
            $channels = ['members'];
            break;
        case 'time':
            $channels = ['private-managers'];
            $worker = hpm_object( 'person', $object->worker_id );
            if ( $worker->role === 'contractor' ) {
                $channels[] = 'private-contractor-' . $object->worker_id;
            }
            break;
        default: break;
    }
    return $channels;
}

/**
 * Delete Dependencies Server-Side
 * @param  String $object_type
 * @param  String $object_id
 * @return
 */
function hpm_cleanup_object( $object_type, $object_id ) {
    global $wpdb;
    switch ( $object_type ) {

        case 'resource':

            // Mutation Messages
            $table = $wpdb->prefix . 'hpm_messages';
            $sql = "DELETE FROM $table WHERE content LIKE '%\"object_id\":\"$object_id%'";
            $wpdb->query($sql);

            break;

        default: break;
    }
}
