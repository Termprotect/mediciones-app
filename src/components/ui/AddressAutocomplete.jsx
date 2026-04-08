import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin } from "lucide-react";

const GOOGLE_MAPS_API_KEY = ""; // TODO: Add your Google Maps API key here

/**
 * Address input with Google Places Autocomplete.
 * If API key is not set, falls back to a regular text input.
 */
export default function AddressAutocomplete({ value, onChange, onPlaceSelect, placeholder = "Dirección completa" }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const sessionTokenRef = useRef(null);

  // Load Google Maps API script
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return;
    if (window.google?.maps?.places) {
      setApiLoaded(true);
      return;
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      const check = setInterval(() => {
        if (window.google?.maps?.places) {
          setApiLoaded(true);
          clearInterval(check);
        }
      }, 100);
      return () => clearInterval(check);
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=es`;
    script.async = true;
    script.defer = true;
    script.onload = () => setApiLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Initialize autocomplete service
  useEffect(() => {
    if (!apiLoaded || !window.google?.maps?.places) return;
    autocompleteRef.current = new window.google.maps.places.AutocompleteService();
  }, [apiLoaded]);

  const fetchSuggestions = useCallback(
    (input) => {
      if (!autocompleteRef.current || !input || input.length < 3) {
        setSuggestions([]);
        return;
      }

      if (!sessionTokenRef.current) {
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
      }

      autocompleteRef.current.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: "es" },
          types: ["address"],
          sessionToken: sessionTokenRef.current,
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
          } else {
            setSuggestions([]);
          }
        }
      );
    },
    [apiLoaded]
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    if (apiLoaded) {
      fetchSuggestions(val);
      setShowSuggestions(true);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    onChange(suggestion.description);
    setSuggestions([]);
    setShowSuggestions(false);
    sessionTokenRef.current = null;

    // Get place details for the Maps link
    if (window.google?.maps?.places && onPlaceSelect) {
      const service = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );
      service.getDetails(
        { placeId: suggestion.place_id, fields: ["geometry", "formatted_address", "url"] },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            onPlaceSelect({
              address: place.formatted_address || suggestion.description,
              mapsUrl: place.url || `https://www.google.com/maps/place/?q=place_id:${suggestion.place_id}`,
              lat: place.geometry?.location?.lat(),
              lng: place.geometry?.location?.lng(),
            });
          }
        }
      );
    }
  };

  // Close suggestions on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (inputRef.current && !inputRef.current.parentElement.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-9 pr-4 py-2.5 bg-dark border-2 border-border rounded-xl text-white text-sm placeholder:text-muted/50 outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-dark border-2 border-border rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s.place_id}
              onClick={() => handleSelectSuggestion(s)}
              className="w-full text-left px-4 py-3 text-sm text-white hover:bg-surface transition-colors cursor-pointer border-b border-border/50 last:border-0 flex items-start gap-2"
            >
              <MapPin className="w-4 h-4 text-muted mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">{s.structured_formatting?.main_text}</div>
                <div className="text-xs text-muted">{s.structured_formatting?.secondary_text}</div>
              </div>
            </button>
          ))}
          <div className="px-4 py-1.5 text-[10px] text-muted/50 text-right">
            Powered by Google
          </div>
        </div>
      )}

      {!GOOGLE_MAPS_API_KEY && (
        <p className="text-[10px] text-muted/50 mt-1">
          Configura GOOGLE_MAPS_API_KEY para autocompletado de direcciones
        </p>
      )}
    </div>
  );
}
