import { panel, text } from "@metamask/snaps-ui";

type DialogType = 'alert' | 'confirmation' | 'prompt';

interface SnapDialogOptions {
  type: DialogType;
  contentArray: string[];
  placeholder?: string;
}

export async function invokeSnapDialog({ type, contentArray, placeholder }: SnapDialogOptions) {
  // Construct the content for the panel using the contentArray
  const panelContent = contentArray.map(content => text(content));

  // Construct the basic dialog request object
  const dialogRequest = {
    method: 'snap_dialog',
    params: {
      type: type,
      content: panel(panelContent),
    },
  };

  // If it's a prompt type and a placeholder is provided, add it to the request
  if (type === 'prompt' && placeholder) {
    dialogRequest.params.placeholder = placeholder;
  }

  return await snap.request(dialogRequest);
}
