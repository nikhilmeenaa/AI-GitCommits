export const generateCommitPromptForFileChange = (
  diff: string,
  fileName: string
) => {
  const prompt = `Hey, you need to act a coder on my behalf and your work is to generate a commit point for the given changes in the given code, 
  it can consist of multiple points or single point, the commit points should be brief and to the point, 
  should not have any large code example in it, and genereate only and only points no other extra things, 

  for example if the file changes are like this
  "
  - <link rel="icon" type="image/svg+xml" href="logo_light.svg" />
  + <link rel="icon" type="image/svg+xml" href="dark_logo.svg" />
  "

  the response should be like this 

  "
  - Changed the href of link to point from logo_light to dark_logo
  "

  here, the response does not contain any header of footer lines, but instead directly gives commit points no other extra things in form of
  header or footer

  similary generate commit message for file name ${fileName} and these the files changes done "${diff}"
  `;
  return prompt;
};
