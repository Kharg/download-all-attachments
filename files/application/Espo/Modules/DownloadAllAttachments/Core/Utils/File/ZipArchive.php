<?php

namespace Espo\Modules\DownloadAllAttachments\Core\Utils\File;

use Espo\Core\Utils\File\Manager;
use RuntimeException;

class ZipArchive extends \ZipArchive
{
    private Manager $fileManager;

    public function __construct(?Manager $fileManager = null)
    {
        if ($fileManager === null) {
            $fileManager = new Manager();
        }

        $this->fileManager = $fileManager;
    }

    protected function getFileManager()
    {
        return $this->fileManager;
    }


    public function zip($sourcePath, $file)
    {

    }

}