import type { Block } from "../../types/lesson";
import Prose from "./blocks/Prose";
import Quiz from "./blocks/Quiz";
import RunnableCode from "./blocks/RunnableCode";
import ExecutionVisualizer from "../visualizer/ExecutionVisualizer";
import DsaViz from "../visualizer/dsa/DsaViz";
import UserDrivenViz from "../visualizer/UserDrivenViz";
import ChallengeRunner from "../challenge/ChallengeRunner";

interface Props {
  lessonId: string;
  blocks: Block[];
}

// Renders an ordered list of content blocks, dispatching by `kind`.
export default function LessonRenderer({ lessonId, blocks }: Props) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "prose":
            return <Prose key={i} block={block} />;
          case "runnable":
            return <RunnableCode key={i} block={block} draftKey={`${lessonId}::${i}`} />;
          case "visualized":
            return (
              <ExecutionVisualizer
                key={i}
                initialCode={block.code}
                title={block.title}
                draftKey={`${lessonId}::${i}`}
              />
            );
          case "dsa-viz":
            return <DsaViz key={i} block={block} />;
          case "user-viz":
            return (
              <UserDrivenViz key={i} block={block} draftKey={`${lessonId}::${i}`} />
            );
          case "challenge":
            return <ChallengeRunner key={i} block={block} id={`${lessonId}::${i}`} />;
          case "quiz":
            return <Quiz key={i} block={block} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
