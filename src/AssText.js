import classNames from "classnames";
import { useCallback, useEffect, useState, useRef } from "react";

import styles from "./AssText.module.css";
import { useAssContext } from "./assState";

const ALPHA_LOWER = "abcdefghijklmnopqrstuvwxyz".split("");

export default function AssText() {
  const [assState, assDispatch] = useAssContext();
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => setIsFocused(ref?.current.contains(e.target));

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [ref, setIsFocused]);

  const handleKeystroke = useCallback(
    (e) => {
      if (!isFocused) {
        return;
      }

      if (e.key === "Escape") {
        assDispatch({ type: "RESTART_ASS" });
        return;
      }

      if (ALPHA_LOWER.includes(e.key)) {
        if (!assState.startTime) {
          assDispatch({ type: "START_ASS" });
        }
        assDispatch({ type: "LETTER", payload: e.key });
      }
      if (e.key === " ") {
        assDispatch({ type: "SPACE" });
      }
      if (e.key === "Backspace") {
        assDispatch({ type: "BACKSPACE" });
      }
    },
    [assState, assDispatch, isFocused]
  );

  useEffect(() => {
    document.addEventListener("keyup", handleKeystroke);
    return () => {
      document.removeEventListener("keyup", handleKeystroke);
    };
  }, [handleKeystroke]);
  let absIndex = 0;
  return (
    <div ref={ref} autoFocus id={styles.text}>
      {assState.text
        .map((word) => `${word} `)
        .map((word, wordIndex) => {
          const currentWordIndex = assState.typedText.length;

          return (
            <span
              key={wordIndex}
              className={classNames(
                styles.word,
                {
                  [styles.active]: currentWordIndex === wordIndex,
                },
                { [styles.future]: wordIndex > currentWordIndex }
              )}
            >
              {word.split("").map((letter, letterIndex) => {
                let typedLetter;
                if (letterIndex === word.length - 1) {
                  typedLetter = null;
                } else if (wordIndex < currentWordIndex) {
                  typedLetter = assState.typedText[wordIndex][letterIndex];
                } else if (wordIndex === currentWordIndex) {
                  typedLetter = assState.currentWord[letterIndex];
                }
                absIndex += 1;
                return (
                  <span
                    key={letterIndex}
                    className={classNames(
                      styles.letter,
                      {
                        [styles.correct]: typedLetter && letter === typedLetter,
                      },
                      {
                        [styles.incorrect]:
                          typedLetter && letter !== typedLetter,
                      },
                      {
                        [styles.cursor]: absIndex === assState.absPosition,
                      },
                      { [styles.space]: typedLetter === null }
                    )}
                  >
                    {letter === " " ? "a" : letter}
                  </span>
                );
              })}
            </span>
          );
        })}
    </div>
  );
}
