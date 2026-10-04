import { DocPage, docMetadata } from '@/components/DocPage';

export const revalidate = 60;
export const generateMetadata = () => docMetadata('terms');

export default function Page() {
  return <DocPage page="terms" />;
}
