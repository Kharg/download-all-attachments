<?php

namespace Espo\Modules\DownloadAllAttachments\EntryPoints;

use Espo\Modules\DownloadAllAttachments\Core\Utils\File\ZipArchive;
use Espo\Core\Api\Request;
use Espo\Core\Api\Response;
use Espo\Core\EntryPoint\EntryPoint;
use Espo\Core\Exceptions\BadRequest;
use Espo\Core\Exceptions\Forbidden;
use Espo\Core\Exceptions\NotFoundSilent;
use Espo\Entities\Attachment as AttachmentEntity;
use Espo\Core\Acl;
use Espo\Core\ORM\EntityManager;
use GuzzleHttp\Psr7\Utils;

class DownloadAll implements EntryPoint
{
    protected Acl $acl;
    protected EntityManager $entityManager;

    public function __construct(Acl $acl, EntityManager $entityManager)
    {
        $this->acl = $acl;
        $this->entityManager = $entityManager;
    }

    public function run(Request $request, Response $response): void
    {
        $idList = $request->getQueryParams();
        
        if (!$idList || !is_array($idList)) {
            throw new BadRequest();
        }
    
        $id = array_values($idList['id']);
        $i = 0;
        $zip = new ZipArchive();
        $filename = 'data/upload/attachments.zip';
        $res = $zip->open($filename, ZipArchive::CREATE);
        if ($res === true) {
            foreach ($id as $row) {
                $attachment = $this->entityManager->getEntity(AttachmentEntity::ENTITY_TYPE, $row);
    
                if (!$attachment) {
                    throw new NotFoundSilent();
                }
    
                if (!$this->acl->checkEntity($attachment)) {
                    throw new Forbidden();
                }
    
                $filePath = $this->entityManager->getRepository(AttachmentEntity::ENTITY_TYPE)->getFilePath($attachment);
    
                if (!file_exists($filePath)) {
                    throw new NotFoundSilent();
                }
    
                $outputFileName = $attachment->get('name');
                $outputFileName = str_replace("\"", "\\\"", $outputFileName);
    
                $zip->addFile($filePath, $outputFileName);
            }
    
            $zip->close();
    
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $filename);
            $name = $request->getQueryParam('name');
            $name = preg_replace('/[<>:"\/\\\|\?\*]/', ' ', $name);
            $name = rtrim($name, ". ");

            if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') {
                $response->setHeader('Cache-Control', 'max-age=120');
                $response->setHeader('Pragma', 'public');
            } else {
                $response->setHeader('Cache-Control', 'private, max-age=120, must-revalidate');
                $response->setHeader('Pragma', 'no-cache');
            }
    
            $response->setHeader('Content-Type', $mimeType);
            $response->setHeader('Content-Disposition', 'attachment; filename="' . $name . '.zip";');
            $response->setHeader('Accept-Ranges', 'bytes');
            $response->setHeader('Content-Length', (string) filesize($filename));
    
            // Use a stream to set the response body
            $stream = Utils::streamFor(fopen($filename, 'r'));
            $response->setBody($stream);
    
            if (file_exists($filename)) {
                unlink($filename);
            }
        } else {
            throw new Forbidden();
        }
    }
}