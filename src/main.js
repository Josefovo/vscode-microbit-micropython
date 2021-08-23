const vscode = require('vscode')
const ui = require('./ui');
const {
  extensionUri,
  uflash,
  ufs,
  getCurrentWorkspace,
  getFilesInDir,
  getVisibleFoldersInDir,
  assertFileIsIncluded,
  listFilesOnMicrobit,
  removeFilesFromMicrobit,
  getFileFromMicrobit,
  deleteFileFromDir,
  cloneRepository,
  checkFileExist,
  isOnline,
  copyFiles
} = require('./extension');
const { fstat } = require('fs');


// GLOBALS
const EXAMPLES_REPO = "https://github.com/makinteract/micropython-examples";
const MICROBIT_LIBS_REPO = "https://github.com/makinteract/microbit.git";




/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

  const init = vscode.commands.registerCommand('extension.init', async function () {
    try {
      // 1. Copy libs in current workspace
      // get workspace
      const workspace = await getCurrentWorkspace();
      // check whether microbit folder is there
      // clone it if not there
      const libs = await checkFileExist("microbit", workspace.uri);
      if (!libs) {
        cloneRepository(MICROBIT_LIBS_REPO, "microbit", workspace.uri);
      }

      // 2. Download examples if not there
      // check whether examples are there
      // download them if not
      const examplesExist = await checkFileExist("examples", extensionUri());
      if (!examplesExist && await isOnline()) {
        cloneRepository(EXAMPLES_REPO, "examples", extensionUri());
        ui.vsInfo("Downloading examples");
        ui.outInfo("Downloading examples");
      }

      // 3. Show to the user the list of template files in examples and ask to pick one
      const examples = vscode.Uri.joinPath(extensionUri(), "examples");
      const list = await getVisibleFoldersInDir(examples);
      list.unshift("Empty - do not modify the current directory"); // add an empy project to start
      const pick = await ui.showQuickPick(list, "Select a template for the project");
      if (!pick || pick.startsWith("Empty")) return; // done


      // 4. If the user selected one template
      // Ask user to confirm overriding of project
      const mainExist = await checkFileExist("main.py", workspace.uri);
      if (mainExist) {
        const ans = await ui.confirmationMessage("Are you sure you want to override your project?", ["Yes", "No"]);
        if (ans === "No" || ans === undefined) return; // bye bye 
      }

      // copy files
      const src = vscode.Uri.joinPath(examples, pick);
      copyFiles(src, workspace.uri);


    } catch (e) {
      ui.vsError(`${e}`);
      ui.outError(e);
    }
  });


  const fetchExamples = vscode.commands.registerCommand('extension.fetch-examples', async function () {
    try {
      if (! await isOnline())
        throw new Error("No internet connection.")

      // delete if already exists
      const examplesExist = await checkFileExist("examples", extensionUri());
      if (examplesExist) {
        await deleteFileFromDir("examples", extensionUri());
      }
      // clone again examples
      cloneRepository(EXAMPLES_REPO, "examples", extensionUri());
      ui.vsInfo("Examples successfully downloaded");
      ui.outInfo("Examples successfully downloaded");
    }
    catch (e) {
      // console.log(`Folder ${todelete.toString()} not found`);
      ui.vsError(`${e}`);
      ui.outError(e);
    }
  });


  const flashMicropython = vscode.commands.registerCommand('extension.flash-micropython', async function () {
    try {
      await uflash();
      ui.vsInfo("MicroPython successfully installed");
      ui.outInfo("MicroPython successfully installed");
    } catch (e) {
      ui.vsError(`${e}`);
      ui.outError(e);
    }
  });

  const flash = vscode.commands.registerCommand('extension.flash', async function () {
    try {
      // get all files in the workspace
      const workspace = await getCurrentWorkspace();
      const workspaceFiles = await getFilesInDir(workspace.uri);
      // is main.py inclued?
      assertFileIsIncluded("main.py", workspaceFiles);

      // Flash files one by one
      for (let { fsPath: filename } of workspaceFiles) {
        // it might throw an error
        await ufs(`put "${filename}"`);
        ui.outInfo(`File "${filename}" copied on micro:bit`);
      }
      ui.vsInfo("Files successfully uploaded");

    } catch (e) {
      ui.vsError(`${e}`);
      ui.outError(e);
    }
  });


  const rmAll = vscode.commands.registerCommand('extension.rmAll', async function () {
    try {
      const files = await listFilesOnMicrobit();
      await removeFilesFromMicrobit(files);
    } catch (e) {
      ui.vsError(`${e}`);
      ui.outError(e);
    }
  });


  const rmFile = vscode.commands.registerCommand('extension.rmFile', async function () {
    try {
      const files = await listFilesOnMicrobit();
      const fileToRemove = await ui.showQuickPick(files, '')

      if (!fileToRemove) throw new Error("No input specified");
      await removeFilesFromMicrobit([fileToRemove]);
    } catch (e) {
      ui.vsError(`${e}`);
      ui.outError(e);
    }
  });


  const getFile = vscode.commands.registerCommand('extension.getFile', async function () {
    try {
      const workspace = await getCurrentWorkspace();
      const files = await listFilesOnMicrobit();
      if (!files || files.length == 0) throw new Error("No files found on micro:bit");

      const fileSelected = await ui.showQuickPick(files, '')
      if (!fileSelected) throw new Error("No input specified");

      const fileExist = await checkFileExist(fileSelected, workspace.uri);
      if (fileExist) {
        const ans = await ui.confirmationMessage(`Are you sure you want to override ${fileSelected}?`, ["Yes", "No"]);
        if (ans === "No" || ans === undefined) return; // bye bye 
      }
      // get the file
      getFileFromMicrobit(fileSelected, workspace.uri);

    } catch (e) {
      ui.vsError(`${e}`);
      ui.outError(e);
    }
  });


  // COMMANDS
  context.subscriptions.push(init);
  context.subscriptions.push(fetchExamples);
  context.subscriptions.push(flashMicropython);
  context.subscriptions.push(flash);
  context.subscriptions.push(rmAll);
  context.subscriptions.push(rmFile);
  context.subscriptions.push(getFile);

}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
  activate,
  deactivate
}
