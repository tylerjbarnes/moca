<?php
    if (!is_user_logged_in()) {
        header("Location: /login"); /* Redirect browser */
        exit();
    }
    if (hpm_user_role() != "client") {
        global $wpdb;
        $option_table = $wpdb->prefix . 'hpm_options';
        $pusher_key = $wpdb->get_var(
            "SELECT option_value FROM $option_table messages WHERE option_name = 'pusher_key'"
        );
    }
?>

<!DOCTYPE html>
<html <?php language_attributes(); ?>>
  <head>
    <title>moca</title>

    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <script>
        var ajaxurl = "<?php echo admin_url('admin-ajax.php'); ?>";
        var pluginUrl = "<?php echo plugins_url( null, __FILE__ ); ?>";
        var PAGESLUG = "<?php echo "dashboard"; ?>";
        var appState = {
            mode: "<?php echo get_query_var('tab') ? get_query_var('tab') : "projects"; ?>",
            itemId: "<?php echo get_query_var('item'); ?>" ? "<?php echo get_query_var('item'); ?>" : null
        };
        var currentUserWpId = "<?php echo get_current_user_id(); ?>";
        var mocaUserRole = "<?php echo hpm_user_role(); ?>";
        var pusherKey = "<?php echo $pusher_key; ?>";
        if (appState.mode == 'people') {
            appState.mode = 'persons';
        }
    </script>
  </head>
  <body>
    <div id="app"></div>
    <script src="https://js.pusher.com/4.1/pusher.min.js"></script>
    <script src="http://localhost:8080/dist/build.js"></script>
  </body>
</html>
