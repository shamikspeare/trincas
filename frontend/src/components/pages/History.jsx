import Breadcrumb from '../Breadcrumb';
import ScrollCircle from '../ScrollCircle';

const History = () => {
  return (
    <main className="w-full bg-white min-h-[60vh]">
      <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'History' }]} />
      <div className="w-full">
        <ScrollCircle />
      </div>
    </main>
  );
};

export default History;