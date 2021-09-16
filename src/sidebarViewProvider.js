const vscode = require('vscode');
const getNonce = require('./getNonce');

class SideViewProvider {
  constructor(_extensionUri) {
    this._extensionUri = _extensionUri;
  }

  onMessageReceived(callback) {
    if (callback) this.onMessageReceived = callback;
  }

  resolveWebviewView(webviewView /* , context, token */) {
    this._view = webviewView;
    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    // call this when receiving a message from sidebar
    if (this.onMessageReceived) webviewView.webview.onDidReceiveMessage(this.onMessageReceived);
  }

  sendMessage(msg) {
    if (this._view) {
      this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
      this._view.webview.postMessage(msg);
    }
  }

  getHtmlForWebview(webview) {
    const bundleScript = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'public', 'build', 'bundle.js'));
    const bundlecss = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'public', 'build', 'bundle.css'));
    const globalcss = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'public', 'global.css'));

    const nonce = getNonce();
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset='utf-8'>
        <meta name='viewport' content='width=device-width,initial-scale=1'>
        <!---
        <meta http-equiv="Content-Security-Policy"
        content="default-src 'none'; img-src ${webview.cspSource} 
        https:; script-src ${webview.cspSource}; style-src ${webview.cspSource};"/>
        -->
        
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; 
        script-src 'nonce-${nonce}';">

        <link rel='stylesheet' href='${globalcss}'>
        <link rel='stylesheet' href='${bundlecss}'>
      
        <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        </script>
        <script defer nonce="${nonce}" src='${bundleScript}'></script>
      
      </head>

      <body>
      </body>
      </html>`;
  }
}

// VERY IMPORTANT: make sure the ID match the one in the package.json file
SideViewProvider.viewType = 'micro-bit-python.view';

module.exports = {
  SideViewProvider,
};
