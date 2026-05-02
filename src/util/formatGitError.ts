export const formatGitError = (errorMessage: string): string => {
    const prefixesToRemove = ['error: ', 'warning: ', 'fatal: '];

    let formattedMessage = errorMessage;
    for (const prefix of prefixesToRemove) {
        if (formattedMessage.startsWith(prefix)) {
            formattedMessage = formattedMessage.substring(prefix.length);
            break;
        }
    }

    const hintIndex = formattedMessage.indexOf('hint:');
    if (hintIndex !== -1) formattedMessage = formattedMessage.substring(0, hintIndex).trim();

    if (formattedMessage.length > 0 && /[a-z]/.test(formattedMessage.charAt(0)))
        formattedMessage = formattedMessage.charAt(0).toUpperCase() + formattedMessage.substring(1);

    return formattedMessage;
};
