
# SmugMug - Sync (in NodeJS)

I had a bunch of pictures on my file system and we've decided to move them all to SmugMug.  There are many ways to upload files (like through your browser, iPhoto, etc) - but I already had my photos in named folders.

So I wrote this script in NodeJS that automatically creates galleries (according to the folder name), then uploads the photos.  If a photo is already uploaded, then it just skips it. Same with videos.

I'm not really interested in packaging it nicely or documenting it yet, but if you're looking to mess with SmugMug and NodeJS, then this has some helpful concepts in the code.

You will need to create a 'settings.json' file with your settings (look at example-settings.json).

