<?php
/*
    Plugin Name: Moca
    Plugin URI: http://tylerbarnes.io
    Description: Empowers easy management of projects, contractors, and clients via simple time budgeting.
    Author: Tyler Barnes
    Version: 0.2
    Author URI: http://tylerbarnes.io
*/


class Moca {

    /**
     * Sets up a single instance of Hershey Project Manager
     *
     * Based on BuddyPress structure
     *
     * @return Moca only instance of Moca
     */
    public static function instance() {

        // Store the instance locally to avoid private static replication
        static $instance = null;

        // Only run these methods if they haven't been run previously
        if ( null === $instance ) {
            $instance = new Moca;
            $instance->constants();
            $instance->setup_actions();
            $instance->includes();
        }

        // Cron
        if ( ! wp_next_scheduled( 'hourly_tasks_hook' ) ) {
            wp_schedule_event( time(), 'hourly', 'hourly_tasks_hook' );
        }

        // Always return the instance
        return $instance;

    }

    /**
     * Defines plugin constants
     */
    private function constants() {
        $this->plugin_dir = plugin_dir_path(__FILE__);
        // @todo wp option for dashboard and login pages
        $this->dashboard_slug = 'dashboard';
        $this->login_slug = 'login';
    }

    /**
     * Sets up actions and filters that hook into WP
     */
    private function setup_actions() {
        register_activation_hook( __FILE__, array($this, "activate") );
        add_action( 'admin_bar_menu', array( $this, 'dashboard_link' ), 999 );
        add_action( 'init', array( $this, 'setup_rewrites' ), 10, 0);
        add_action( 'wp_ajax_handle_ajax_request', array($this,'handle_ajax_request') );
        add_action( 'wp_ajax_hpm_api', array($this,'hpm_api') );
        add_filter( 'template_include', array($this, 'dashboard_template'), 99 );
        add_filter( 'template_include', array($this, 'login_template'), 99 );
        add_filter( 'template_include', array($this, 'client_template'), 99 );
        add_filter( 'login_redirect', array($this, 'login_redirect'), 10, 3 );
        add_action( 'init', array( $this, 'remove_admin_bar' ), 10, 0 );
        add_filter( 'wp_mail_from_name', function( $name ) {
            return 'Jess Hershey Projects';
        });
        add_filter( 'get_avatar' , array( $this, 'avatar_initials' ) , 1 , 5 );
        add_action( 'init', array( $this, 'start_session' ), 1 );
        add_action( 'wp_logout', array( $this, 'end_session' ) );
        add_action( 'wp_login', array( $this, 'end_session' ) );
        add_action( 'hourly_tasks_hook', array( $this, 'do_hourly_tasks' ) );
        add_action( 'user_register', array( $this, 'create_person' ) );
    }

    /**
     * Dashboard Link in Admin Bar
     */
    public function dashboard_link($wp_admin_bar) {
    	$args = array(
    		'id' => 'hpm',
    		'title' => 'Project Dashboard',
    		'href' => '/dashboard',
    		'meta' => array(
    			'class' => 'hpm',
    			'title' => 'Launch Hershey Project Manager'
			)
    	);
    	$wp_admin_bar->add_node($args);
    }

    /**
     * Includes required files
     */
    private function includes() {
        require( $this->plugin_dir . 'api/lib/Pusher.php' );
        require( $this->plugin_dir . 'api/notifications.php' );
        require( $this->plugin_dir . 'api/api.php' );
        require( $this->plugin_dir . 'api/client-access.php' );
    }

    /**
     * Calls functions necessary for activating the plugin
     */
    public function activate() {
        $this->create_roles();
        $this->setup_tables();
        $this->setup_rewrites();

        global $wp_rewrite;
        $wp_rewrite->flush_rules(true);
    }

    /**
     * Creates custom WP user roles and capabilities
     */
    private function create_roles() {

        // Remove roles for reset during development
        remove_role( 'client' );
        remove_role( 'contractor' );
        remove_role( 'manager' );

        add_role( 'client', __('Client'), array(
        ) );
        add_role( 'contractor', __('Contractor'), array(
            'edit_projects' => true,
        ) );
        add_role( 'manager', __('Manager'), array(
            'edit_projects' => true,
            'manage_projects' => true,
            'read_persons' => true,
            // 'manage_clients' => true,
            // 'manage_contractors' => true
        ) );

        // Modify roles Admin or higher
        $GLOBALS['wp_roles'];
        $min_cap = 'manage_options';
        $custom_caps = [
            'read_others_projects',
            'edit_projects',
            'manage_projects',
            'read_persons',
            // 'manage_clients',
            // 'manage_contractors',
            // 'manage_managers'
        ];
        function has_cap($role_obj, $cap) {
            if (array_key_exists($cap, $role_obj->capabilities)){
                if ($role_obj->capabilities[$cap] === true) {
                    return true;
                }
            }
            return false;
        }
        foreach ( $GLOBALS['wp_roles']->role_objects as $role_obj ){
            foreach ($custom_caps as $custom_cap) {
                if ( has_cap($role_obj, $min_cap) && !has_cap($role_obj, $custom_cap) ){
                    $role_obj->add_cap( $custom_cap, true );
                }
            }
        }

    }

    /**
     * Sets up Moca's database tables
     */
    private function setup_tables() {

        // global $wpdb;
        // $charset_collate = $wpdb->get_charset_collate();
        // require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
        //
        // $table_name = $wpdb->prefix . 'hpm_projects';
        // $sql = "CREATE TABLE $table_name (
        //     id mediumint(9) NOT NULL AUTO_INCREMENT,
        //     title text NOT NULL,
        //     client_id mediumint(9),
        //     contractor_id mediumint(9),
        //     manager_id mediumint(9),
        //     flagged tinyint(1) NOT NULL,
        //     settings text,
        //     PRIMARY KEY  (id)
        // ) $charset_collate;";
        // dbDelta( $sql );
        //
        // $table_name = $wpdb->prefix . 'hpm_instances';
        // $sql = "CREATE TABLE $table_name (
        //     project_id mediumint(9) NOT NULL,
        //     instance_index mediumint(9) NOT NULL AUTO_INCREMENT,
        //     start date NOT NULL,
        //     due date,
        //     estimate float(10,2),
        //     max float(10,2),
        //     PRIMARY KEY  (instance_index, project_id)
        // ) $charset_collate;";
        // dbDelta( $sql );
        //
        // $table_name = $wpdb->prefix . 'hpm_transactions';
        // $sql = "CREATE TABLE $table_name (
        //     id mediumint(9) NOT NULL AUTO_INCREMENT,
        //     author_id mediumint(9) NOT NULL,
        //     client_id mediumint(9),
        //     instance_id mediumint(9),
        //     task_id mediumint(9),
        //     type tinytext NOT NULL,
        //     hours float(10,2) NOT NULL,
        //     date date NOT NULL,
        //     expiration_date date,
        //     memo mediumtext,
        //     pending tinyint(1) NOT NULL,
        //     PRIMARY KEY  (id)
        // ) $charset_collate;";
        // dbDelta( $sql );
        //
        // $table_name = $wpdb->prefix . 'hpm_messages';
        // $sql = "CREATE TABLE $table_name (
        //     id mediumint(9) NOT NULL AUTO_INCREMENT,
        //     type tinytext NOT NULL,
        //     author_id mediumint(9) NOT NULL,
        //     instance_id mediumint(9) NOT NULL,
        //     parent_id mediumint(9),
        //     content text NOT NULL,
        //     resolved tinyint(1) NOT NULL,
        //     datetime datetime NOT NULL,
        //     PRIMARY KEY  (id)
        // ) $charset_collate;";
        // dbDelta( $sql );
        //
        // global $hpm_db_version;
        // $hpm_db_version = '1.1';
        // add_option( 'hpm_db_version', $hpm_db_version );

    }

    /**
     * Sets up rewrite tags and rules for the dashboard
     */
    public function setup_rewrites() {

        add_rewrite_tag('%tab%', '([^&]+)');
        add_rewrite_tag('%item%', '([^&]+)');

        // @todo add a wp option to store this page id
        $dashboard_page = get_page_by_path( 'dashboard' );
        define('PAGE_ID', $dashboard_page->ID);

        add_rewrite_rule($this->dashboard_slug.'/([^/]*)/?/([^/]*)/?','index.php?page_id='.PAGE_ID.'&tab=$matches[1]&item=$matches[2]','top');
        add_rewrite_rule($this->dashboard_slug.'/([^/]*)/?','index.php?page_id='.PAGE_ID.'&tab=$matches[1]','top');

        // pusher auth
        add_rewrite_rule('pusher_auth/?', 'wp-content/plugins/moca/pusher_auth.php', 'top');

    }

    /**
     * Adds template filter to use Moca's dashboard template
     */
    public function dashboard_template( $template ) {
        if ( is_page( $this->dashboard_slug )  ) {
            $new_template = plugin_dir_path(__FILE__).'index.php';
            if ( !empty($new_template) ) {
                return $new_template ;
            }
        }
        return $template;
    }
    /**
     * Adds template filter to use Moca's login template
     */
    public function login_template( $template ) {
        if ( is_page( $this->login_slug )  ) {
            $new_template = plugin_dir_path(__FILE__).'login.php';
            if ( !empty($new_template) ) {
                return $new_template ;
            }
        }
        return $template;
    }
    /**
     * Adds template filter to use Moca's client portal template
     */
    public function client_template( $template ) {
        if ( is_page( "client-portal" )  ) {
            $new_template = plugin_dir_path(__FILE__).'client-portal.php';
            if ( !empty($new_template) ) {
                return $new_template ;
            }
        }
        return $template;
    }

    /**
     * Redirects non-admins to dashboard
     *
     * https://codex.wordpress.org/Plugin_API/Filter_Reference/login_redirect
     */
    public function login_redirect( $redirect_to, $request, $user ) {

        $dashboard_page = get_page_by_path( 'dashboard' );

        //is there a user to check?
        if ( isset( $user->roles ) && is_array( $user->roles ) ) {
            //check for clients
            if ( in_array( 'client', $user->roles ) ) {
                // redirect them to the default place
                return "/client-portal";
            } else {
                return get_post_permalink( $dashboard_page->ID );
            }
        } else {
            return $redirect_to;
        }

    }

    /**
     * Hides the admin bar for non-admin users
     */
    public function remove_admin_bar() {
        if (!current_user_can('administrator') && !is_admin()) {
            show_admin_bar(false);
        }
    }

    public function avatar_initials( $avatar, $id_or_email, $size, $default, $alt ) {

        // $user = false;
        //
        // if ( is_numeric( $id_or_email ) ) {
        //
        //     $id = (int) $id_or_email;
        //     $user = get_user_by( 'id' , $id );
        //
        // } elseif ( is_object( $id_or_email ) ) {
        //
        //     if ( ! empty( $id_or_email->user_id ) ) {
        //         $id = (int) $id_or_email->user_id;
        //         $user = get_user_by( 'id' , $id );
        //     }
        //
        // } else {
        //     $user = get_user_by( 'email', $id_or_email );
        // }
        //
        // if ( $user && is_object( $user ) ) {
        //
        //     // get initials
        //     $user_info = get_userdata( $user->ID );
        //     $initials = substr($user_info->first_name, 0, 1) . substr($user_info->last_name, 0, 1);
        //
        //     if ( !hpm_validate_gravatar( $user->ID ) ) {
        //         $avatar = "<div class='avatar avatar-{$size} initials'><span>{$initials}</span></div>";
        //     }
        //
        // }

        return $avatar;

    }

    public function start_session() {
        if(!session_id()) {
            session_start();
        }
    }

    public function end_session() {
        session_destroy();
    }

    public function do_hourly_tasks() {
        hpm_send_project_due_notifications();
    }

    public function create_person( $user_id ) {
        error_log( $user_id );
        $cuid = new EndyJasmi\Cuid;
        $normalCuid = $cuid->cuid();

        $user_info = get_userdata( $user_id );

        $person_data = [
            "id" => $normalCuid,
            "wp_id" => $user_id,
            "name" => $user_info->display_name,
            "role" => $user_info->roles[0],
            "color" => "#777777",
            "time_offset" => -7,
        ];
        hpm_api_create_person( $person_data, null );

    }


    /**
     * Directs all AJAX calls and dies after output
     */
    public function handle_ajax_request() {

        $requested_function = $_POST['function'];
        $args = array_slice( $_POST, 2 );

        // if ( !hpm_verify_nonce( $requested_function, $args ) ) {
        //     echo '<div class="error">Invalid access token. Please refresh your browser.</div>';
        //     die();
        // }

        call_user_func_array( 'hpm_' . $requested_function, $args );
        wp_die();

    }

    public function hpm_api() {
        header('Content-Type: application/json');
        $function_name = 'hpm_api_' . $_POST['functionName'];
        $args = (array) json_decode( stripslashes( $_POST['args'] ) );
        $args = $args ? array_values( $args ) : [];
        wp_send_json( call_user_func_array( $function_name, $args ) );
    }

}

// Setup Dropbox SDK //@todo move this
// require("api/vendor/autoload.php");

/**
 * Returns the only Moca instance
 * @return Moca the only instance of Moca
 */
function hersheyprojectmanager() {
    return Moca::instance();
}

$GLOBALS['hpm'] = hersheyprojectmanager();












// @todo: move probably into a method of the app singleton
//////////////
// Security //
//////////////

function hpm_verify_nonce( $function_name, $args ) {

	$user_id = get_current_user_id();
	$nonce = $args['nonce'];

	switch( $function_name ) {

		case 'load_project_editor':
			$nonce_name = $user_id.$args['project_id'].$function_name;
			return wp_verify_nonce( $nonce, $nonce_name );

		default:
			return true;

	}

}



?>
