import {
    cp,
    mkdir,
    rm,
} from "node:fs/promises";

import {
    resolve,
} from "node:path";

const source =
    resolve("verification-smoke");

const output =
    resolve(
        process.argv[2] ??
            "verification-smoke-dist",
    );

await rm(
    output,
    {
        recursive: true,
        force: true,
    },
);

await mkdir(
    output,
    {
        recursive: true,
    },
);

for (
    const file
    of [
        "index.html",
        "app.js",
    ]
) {
    await cp(
        resolve(
            source,
            file,
        ),
        resolve(
            output,
            file,
        ),
    );
}

console.log(
    `Verification smoke build: ${output}`,
);
