import { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  Navigation,
  RefreshCw,
  Search,
  Building,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { WapdaOffice } from '../types';

export function WapdaOfficeLocator() {
  const [offices, setOffices] = useState<WapdaOffice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [selectedOffice, setSelectedOffice] = useState<WapdaOffice | null>(null);

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wapda_offices')
      .select('*')
      .order('city', { ascending: true });

    if (!error && data) {
      setOffices(data);
      if (data.length > 0) {
        setSelectedOffice(data[0]);
      }
    }
    setLoading(false);
  };

  const filteredOffices = offices.filter((office) =>
    office.city.toLowerCase().includes(searchCity.toLowerCase()) ||
    office.name.toLowerCase().includes(searchCity.toLowerCase())
  );

  const openInMaps = (office: WapdaOffice) => {
    if (office.latitude && office.longitude) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${office.latitude},${office.longitude}`,
        '_blank'
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/${encodeURIComponent(office.address + ', ' + office.city + ', Pakistan')}`,
        '_blank'
      );
    }
  };

  const getDirections = (office: WapdaOffice) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(office.address + ', ' + office.city + ', Pakistan')}`,
      '_blank'
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 lg:pt-8 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 lg:pt-8 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            WAPDA Offices Near You
          </h1>
          <p className="text-slate-600">واپڈا آفسز - قریب ترین واپڈا آفس ڈھونڈیں</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-8">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            placeholder="Search by city name..."
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Offices List */}
          <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {filteredOffices.length > 0 ? (
              filteredOffices.map((office) => (
                <button
                  key={office.id}
                  onClick={() => setSelectedOffice(office)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    selectedOffice?.id === office.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      selectedOffice?.id === office.id ? 'bg-blue-500' : 'bg-blue-100'
                    }`}>
                      <Building className={`w-5 h-5 ${
                        selectedOffice?.id === office.id ? 'text-white' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        selectedOffice?.id === office.id ? 'text-white' : 'text-slate-800'
                      }`}>
                        {office.name}
                      </h3>
                      <p className={`text-sm ${
                        selectedOffice?.id === office.id ? 'text-blue-100' : 'text-slate-500'
                      }`}>
                        {office.city}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500">No offices found</p>
              </div>
            )}
          </div>

          {/* Office Details & Map */}
          <div className="lg:col-span-2">
            {selectedOffice && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                {/* Map Placeholder - Using static image */}
                <div className="relative h-64 bg-gradient-to-br from-blue-100 to-cyan-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                      <p className="text-blue-700 font-medium">{selectedOffice.city}</p>
                      <p className="text-blue-600 text-sm">{selectedOffice.latitude?.toFixed(4)}, {selectedOffice.longitude?.toFixed(4)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openInMaps(selectedOffice)}
                    className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-lg text-blue-600 font-medium text-sm hover:bg-blue-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in Google Maps
                  </button>
                </div>

                {/* Office Info */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">
                    {selectedOffice.name}
                  </h2>
                  <p className="text-sm text-emerald-600 mb-4"> واپڈا ہیڈکوارٹر، {selectedOffice.city}</p>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Address / پتہ</p>
                        <p className="text-slate-800">{selectedOffice.address}</p>
                      </div>
                    </div>

                    {selectedOffice.phone && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Phone className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Phone / فون</p>
                          <a
                            href={`tel:${selectedOffice.phone}`}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {selectedOffice.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {selectedOffice.website && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Globe className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Website / ویب سائٹ</p>
                          <a
                            href={selectedOffice.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {selectedOffice.website.replace('https://', '')}
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Office Hours / آفس کے اوقات</p>
                        <p className="text-slate-800">
                          {selectedOffice.opening_time || '9:00 AM'} - {selectedOffice.closing_time || '5:00 PM'}
                        </p>
                        <p className="text-xs text-slate-500">Monday - Saturday</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => getDirections(selectedOffice)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <Navigation className="w-5 h-5" />
                      Get Directions
                    </button>
                    {selectedOffice.phone && (
                      <a
                        href={`tel:${selectedOffice.phone}`}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
                      >
                        <Phone className="w-5 h-5" />
                        Call Now
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Contact Table */}
            <div className="mt-6 bg-slate-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Quick Reference / فوری رجسٹر
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">City</th>
                      <th className="pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
                      <th className="pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Website</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {offices.slice(0, 5).map((office) => (
                      <tr key={office.id} className="hover:bg-slate-100">
                        <td className="py-3 text-sm font-medium text-slate-800">{office.city}</td>
                        <td className="py-3 text-sm text-slate-600">
                          {office.phone ? (
                            <a href={`tel:${office.phone}`} className="text-blue-600 hover:underline">
                              {office.phone}
                            </a>
                          ) : '-'}
                        </td>
                        <td className="py-3 text-sm">
                          {office.website ? (
                            <a
                              href={office.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Visit
                            </a>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
