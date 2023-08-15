import { panel, text } from '@metamask/snaps-ui';

type DialogType = 'alert' | 'confirmation' | 'prompt';

type SnapDialogOptions = {
  type: DialogType;
  contentArray: string[];
  placeholder?: string;
};

/**
 * Invokes a Snap dialog with the specified options and content.
 *
 * @param options0 - Snap dialog options.
 * @param options0.type - Snap dialog type.
 * @param options0.contentArray - Snap dialog content array.
 * @param options0.placeholder - Snap dialog placeholder.
 * @returns A promise that resolves with the response from the Snap dialog..
 */
export async function invokeSnapDialog({
  type,
  contentArray,
  placeholder,
}: SnapDialogOptions) {
  // Construct the content for the panel using the contentArray
  const panelContent = contentArray.map((content) => text(content));

  // Construct the basic dialog request object
  const dialogRequest: any = {
    method: 'snap_dialog',
    params: {
      type,
      content: panel(panelContent),
      placeholder: '',
    },
  };

  // If it's a prompt type and a placeholder is provided, add it to the request
  if (type === 'prompt' && placeholder) {
    dialogRequest.params.placeholder = placeholder;
  }

  return await snap.request(dialogRequest);
}
