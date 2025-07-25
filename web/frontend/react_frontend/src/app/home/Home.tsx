const Home = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Benvenuto a ft_transcendence
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Feature 1</h3><p className="text-blue-600 text-sm"></p></div>
          <div className="bg-green-50 p-4 rounded-lg"><h3 className="font-semibold text-green-800">Feature 2</h3></div>
          <div className="bg-purple-50 p-4 rounded-lg"><h3 className="font-semibold text-purple-800">Feature 3</h3></div>
        </div>
      </div>
    </div>
  );
};

export default Home;
