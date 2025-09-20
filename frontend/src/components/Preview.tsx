import React, { useEffect, useState } from 'react';
import { WebContainer } from '@webcontainer/api';
import { FileNode } from '../types';
import { convertToWebContainerFormat } from '../utils/fileConverter';

interface PreviewFrameProps {
  files: FileNode[];
  webContainer: WebContainer;
}

export function Preview({ files, webContainer }: PreviewFrameProps) {
  // In real imlementation, this would compile and render the preview
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function main() {
    if (!files || files.length === 0) {
      console.log("No files to write");
      return;
    }

    setIsLoading(true);
    try {
      const webContainerFiles = convertToWebContainerFormat(files);
      await webContainer.mount(webContainerFiles);
      const packageJsonExists = await webContainer.fs.readFile('package.json', 'utf-8')
        .then(() => true)
        .catch(() => false);

      if (!packageJsonExists) {
        throw new Error('package.json not found in the project');
      }

      console.log('Installing dependencies...');
      const installProcess = await webContainer.spawn('npm', ['install']);

      installProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log(data);
        }
      }));

      // Wait for install to complete
      await installProcess.exit;

      await webContainer.spawn('npm', ['run', 'dev']);

      // Wait for `server-ready` event
      webContainer.on('server-ready', (port, url) => {
        console.log(url);
        console.log(port);
        setUrl(url);
        setIsLoading(false);

      });
    } catch (error) {
      console.error('Error setting up WebContainer:', error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (webContainer) {
      main();
    }
  }, [webContainer, files])

  return (
    <div className='h-full flex items-center justify-center text-gray-400'>
      {(isLoading || !url) && (
        <div className='text-center'>
          <p className='mb-2'>
            {isLoading ? 'Setting up project...' : 'Loading...'}
          </p>
        </div>
      )}
      {url && <iframe width={"100%"} height={"100%"} src={url} />}
    </div>
  );
};