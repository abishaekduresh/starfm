<?php
namespace App\Helpers;

use PDO;

class IdGenerator
{
    /**
     * Generate a unique 6-digit integer for a given table.
     *
     * @param PDO $db
     * @param string $table
     * @param string $column
     * @return int
     */
    public static function generate(PDO $db, string $table, string $column = 'uuid'): int
    {
        $maxAttempts = 10;
        $attempt = 0;

        do {
            $uuid = random_int(100000, 999999);
            $attempt++;

            // Check if ID exists
            $stmt = $db->prepare("SELECT COUNT(*) FROM `$table` WHERE `$column` = ?");
            $stmt->execute([$uuid]);
            $count = $stmt->fetchColumn();

            if ($count == 0) {
                return $uuid;
            }

        } while ($attempt < $maxAttempts);

        // Fallback or Exception (unlikely to happen with 900k namespace and low volume)
        throw new \Exception("Failed to generate unique ID after $maxAttempts attempts");
    }
}
