<?php

namespace Espo\Modules\DownloadAllAttachments\EntryPoints;

use Espo\Core\Acl;
use Espo\Core\Api\Request;
use Espo\Core\Api\Response;
use Espo\Core\EntryPoint\EntryPoint;
use Espo\Core\Exceptions\BadRequest;
use Espo\Core\Exceptions\Forbidden;
use Espo\Core\Exceptions\NotFoundSilent;
use Espo\Core\ORM\EntityManager;
use Espo\Core\Utils\Language;
use Espo\Entities\Attachment as AttachmentEntity;
use Espo\Entities\Note as NoteEntity;
use Espo\Repositories\Attachment as AttachmentRepository;
use GuzzleHttp\Psr7\Utils;
use ZipArchive as CoreZipArchive;

class DownloadAll implements EntryPoint
{
    public function __construct(
        private Acl $acl,
        private EntityManager $entityManager,
        private CoreZipArchive $zipArchiveUtil,
        private Language $language
    ){}

    public function run(Request $request, Response $response): void
    {
        $attachmentIdList = $request->getQueryParams()['attachmentIdList'] ?? null;

        if (!is_array($attachmentIdList)) {
            throw new BadRequest('No attachment Ids provided');
        }

        $name = $this->getNameForZipFile(
            entityType: $request->getQueryParam('entityType'),
            entityId: $request->getQueryParam('entityId')
        );

        $uniqueId = uniqid();
        $filename = "data/upload/attachments$uniqueId.zip";

        $res = $this->zipArchiveUtil->open($filename, CoreZipArchive::CREATE);
        if ($res === true) {
            foreach ($attachmentIdList as $row) {

                /** @var AttachmentEntity $attachment */
                $attachment = $this->entityManager->getEntity(AttachmentEntity::ENTITY_TYPE, $row);

                if (!$attachment) {
                    throw new NotFoundSilent();
                }

                if (!$this->acl->checkEntity($attachment)) {
                    throw new Forbidden();
                }

                /** @var AttachmentRepository $attachmentRepository */
                $attachmentRepository = $this->entityManager->getRepository(AttachmentEntity::ENTITY_TYPE);

                $filePath = $attachmentRepository->getFilePath($attachment);

                if (!file_exists($filePath)) {
                    throw new NotFoundSilent();
                }

                $outputFileName = $attachment->get('name');
                $outputFileName = str_replace("\"", "\\\"", $outputFileName);

                $this->zipArchiveUtil->addFile($filePath, $outputFileName);
            }

            $this->zipArchiveUtil->close();

            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $filename);

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

    private function getNameForZipFile(?string $entityType, ?string $entityId): string
    {
        $name = null;

        if ($entityType === NoteEntity::ENTITY_TYPE) {
            $entityId = null;
        }

        if ($entityType && $entityId) {
            try {
                $name = $this->entityManager->getEntityById($entityType, $entityId)?->get('name');
            } catch (\Throwable) {}
        } else {
            $name = $this->language->translateLabel(AttachmentEntity::ENTITY_TYPE, 'scopeNamesPlural');
        }

        if (!$name) {
            $name = 'Attachments';
        }

        return $name;
    }
}