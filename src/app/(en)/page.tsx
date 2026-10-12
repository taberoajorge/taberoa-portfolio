import { Home } from '../../site/Home';
import { metadataFor } from '../../site/meta';

export const metadata = metadataFor('en');

export default function Page() {
  return <Home lang="en" />;
}
