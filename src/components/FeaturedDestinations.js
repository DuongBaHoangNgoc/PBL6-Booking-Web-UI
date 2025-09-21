export default function FeaturedDestinations({ title, destinations, small }) {
  return (
    <section className={small ? "py-6" : "py-16 bg-gray-50"}>
      <div className="container mx-auto px-6">
        {title && (
          <h2
            className={`font-bold text-center ${
              small ? "text-2xl mb-4" : "text-3xl mb-12"
            }`}
          >
            {title}
          </h2>
        )}
        <div
          className={`grid gap-6 ${
            small ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 md:grid-cols-3"
          }`}
        >
          {destinations.map((item, i) => (
            <div
              key={i}
              className={`rounded-lg overflow-hidden shadow ${
                small ? "h-40" : "shadow-lg"
              }`}
            >
              <img
                src={item.image}
                alt={item.name}
                className={`w-full object-cover ${small ? "h-28" : "h-56"}`}
              />
              <div className="p-2">
                <h3
                  className={`font-semibold ${small ? "text-sm" : "text-lg"}`}
                >
                  {item.name}
                </h3>
                <p className="text-gray-500 text-xs">{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
