<?php

namespace Tualo\Office\Eflow\Middlewares;

use Tualo\Office\Basic\TualoApplication as App;
use Tualo\Office\Basic\IMiddleware;

class RequestCounterMiddleware implements IMiddleware
{
    public static function register()
    {
        App::use('eflow', function () {
            if (session_status() !== PHP_SESSION_ACTIVE) {
                session_start();
            }

            $count = isset($_SESSION['eflow_request_count']) ? (int) $_SESSION['eflow_request_count'] : 0;
            $_SESSION['eflow_request_count'] = $count + 1;
        }, -50);
    }
}
