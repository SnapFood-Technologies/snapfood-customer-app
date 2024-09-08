import React, { useEffect, useRef } from "react";

export function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export function getViewerIds(viewers, user_id) {
    let ids = viewers.filter(k => k != user_id);
    return ids.map(i => parseInt(i));
}