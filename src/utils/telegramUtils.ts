/**
 * Requests file download via Telegram WebApp
 * @param url - HTTPS URL of the file to be downloaded
 * @param fileName - Suggested name for the downloaded file
 */
export function requestFileDownload(url: string, fileName: string): void {
  try {
    if (typeof window === 'undefined') {
      console.warn('Window is not defined');
      return;
    }

    const tg = (window as any).Telegram?.WebApp;

    if (!tg) {
      console.warn('Telegram WebApp is not available');
      return;
    }

    // Check if downloadFile method exists (newer versions)
    if (typeof tg.downloadFile === 'function') {
      console.log('Using downloadFile method');
      tg.downloadFile({ url, file_name: fileName }, function(result: boolean) {
        console.log('File download result:', result);
      });
    }
    // Fallback to postEvent for web version
    else if (typeof (window as any).parent !== 'undefined') {
      console.log('Using postEvent via parent.postMessage');
      const eventData = JSON.stringify({
        eventType: 'web_app_request_file_download',
        eventData: { url, file_name: fileName },
      });
      (window as any).parent.postMessage(eventData, 'https://web.telegram.org');
    }
  } catch (error) {
    console.error('Error requesting file download:', error);
  }
}
