# Campus Eats sign-in meme rotation

The university email sign-in uses a fixed 15-image sequence. The hamster-on-a-bike image is first, followed by the other supplied memes in the order shown by their `meme-02.jpg` through `meme-15.jpg` filenames. The email template uses live text and a real verification button; the meme is an optional image with descriptive alternative text, so sign-in remains usable when mail clients block images.

Each normalized email address has a sequence row in PostgreSQL. The sequence advances only after the mail sender reports success. If sending fails, the selected meme remains pending, so a later retry uses the same one. A successful send advances that account to the next image. Different email accounts have separate rows and progress independently. The sequence wraps to the first configured image after the last one and avoids an immediate repeat if the configuration/state would otherwise select the previous image.

The migration `render/migrations/0003_signin_meme_rotation.sql` is applied automatically by the Render server at startup. No manual SQL action is required.

To customize the ordered list, optionally add a Render environment variable named `SIGNIN_MEME_ORDER` whose value is a JSON array of unique image keys, for example:

```json
["hamster-ride", "aaj-bhi", "dispreshaan"]
```

Available keys:

```text
hamster-ride, aaj-bhi, dispreshaan, cat-brain, sigma-cats,
dog-pranaam, chips-kid, dumpling-cat, brownie-pun, message-reaction,
kitten-live, dog-reaction, reaction-pair, game-reaction, camcorder-approval
```

If the setting is omitted or invalid, the built-in 15-image order is used. These memes are sent with the Student/Faculty university-email sign-in flow. Retailers currently sign in with outlet usernames and passwords and do not trigger email verification; changing that would require adding a verified email address for each outlet account.
