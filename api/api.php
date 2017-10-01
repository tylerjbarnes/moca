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
