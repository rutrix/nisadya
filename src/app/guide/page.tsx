import { DocPage, docMetadata } from '@/components/DocPage';

export const revalidate = 60;
export const generateMetadata = () => docMetadata('guide');

export default function Page() {
  return <DocPage page="guide" />;
}
