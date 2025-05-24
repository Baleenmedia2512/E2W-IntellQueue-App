<?php
class ConnectionManager {
    private static $connections = [];
    private static $currentConnection = null;

    public static function connect($dbName) {
        $dbConfig = include '../../DBConfig.php';

        if (!isset($dbConfig[$dbName])) {
            throw new Exception("Configuration for $dbName not found.");
        }

        if (!isset(self::$connections[$dbName])) {
            $config = $dbConfig[$dbName];
            self::$connections[$dbName] = new PDO(
                "mysql:host={$config['servername']};dbname={$config['dbname']};charset=utf8mb4",
                $config['username'],
                $config['password'],
                array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4")
            );
            self::$connections[$dbName]->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        }

        self::$currentConnection = self::$connections[$dbName];
    }

    public static function getConnection() {
        if (self::$currentConnection === null) {
            throw new Exception("No connection is currently active.");
        }
        return self::$currentConnection;
    }
}

?>