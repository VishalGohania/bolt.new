import React, { useEffect, useState } from 'react';
import { WebContainer } from '@webcontainer/api';

interface PreviewFrameProps {
  files: any[];
  webContainer: WebContainer;
}

export function Preview({ files, webContainer }: PreviewFrameProps) {
  // In real imlementation, this would compile and render the preview
  const [url, setUrl] = useState("");

  async function main() {
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
    });
  }

  useEffect(() => {
    if (webContainer) {
      main();
    }
  }, [webContainer])

  return (
    <div className='h-full flex items-center justify-center text-gray-400'>
      {!url && <div className='text-center'>
        <p className='mb-2'>Loading...</p>
      </div>}
      {url && <iframe width={"100%"} height={"100%"} src={url} />}
    </div>
  );
};