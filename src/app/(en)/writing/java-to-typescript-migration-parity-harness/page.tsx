import { ENGINE_REWRITE } from '../../../../content';
import { postMetadata } from '../../../../site/meta';
import { Post } from '../../../../site/Post';

export const metadata = postMetadata(ENGINE_REWRITE);

export default function Page() {
  return <Post post={ENGINE_REWRITE} />;
}
