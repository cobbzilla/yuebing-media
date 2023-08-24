#!/bin/sh

SCRIPT_DIR="$(cd "$(dirname "${0}")" && pwd)"
BASE_DIR="$(cd "${SCRIPT_DIR}"/.. && pwd)"
if [ -z "${BASE_DIR}" ] ; then
    echo >&2 "no basedir"
    exit 2
fi

clean () {
    find "${BASE_DIR}"/lib/esm -type f -exec rm -f {} \;
}

generate () {
    INDEX_TS="${BASE_DIR}"/src/index.ts
    INDEX_BAK=$(mktemp "${BASE_DIR}"/src/index.ts.XXXXXX) || exit 3
    SUCCESS=0
    cd "${BASE_DIR}" && \
    cat "${INDEX_TS}" > "${INDEX_BAK}" && \
    cp "${BASE_DIR}"/src/index.ts.src "${INDEX_TS}" && \
    pnpm tsc && \
    pnpm orm-gen && \
    mv "${INDEX_BAK}" "${INDEX_TS}" && \
    pnpm tsc && \
    SUCCESS=1 || \
    echo >&2 "error generating"
    if [ ${SUCCESS} -eq 0 ] ; then
        echo >&2 "rolling back: ${INDEX_BAK} -> ${INDEX_TS}" && \
        mv "${INDEX_BAK}" "${INDEX_TS}" && \
        echo >&2 "successful rollback"
    fi
}

clean
generate
