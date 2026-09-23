<?php

namespace Tualo\Office\Eflow\Services;

class TimeService
{
    public static function getServerTime(): array
    {
        $timezone = date_default_timezone_get();
        $datetime = new \DateTime('now', new \DateTimeZone($timezone));

        return [
            'timestamp' => $datetime->getTimestamp(),
            'datetime' => $datetime->format('Y-m-d H:i:s'),
            'timezone' => $timezone,
            'iso' => $datetime->format(DATE_ATOM),
        ];
    }
}
