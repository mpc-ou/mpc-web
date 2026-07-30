"use client";

import type { DragEndEvent } from "leaflet";
import { MapPin, Navigation, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Map, MapMarker, MapSearchControl, MapTileLayer, MapZoomControl } from "@/components/ui/map";
import type { PlaceFeature } from "@/components/ui/place-autocomplete";
import { cn } from "@/lib/utils";

export type LocationData = {
  lat: number;
  lng: number;
  displayNameVi: string;
  displayNameEn: string;
};

type Props = {
  initial?: {
    lat?: number | null;
    lng?: number | null;
    nameVi?: string | null;
    nameEn?: string | null;
  } | null;
  onChange: (data: LocationData | null) => void;
  clearable?: boolean;
  placeholder?: string;
};

type PhotonProperties = {
  name?: string;
  housenumber?: string;
  street?: string;
  locality?: string;
  district?: string;
  city?: string;
  county?: string;
  state?: string;
  country?: string;
  countrycode?: string;
  osm_key?: string;
  osm_value?: string;
  type?: string;
};

function buildDisplayNameVi(props: PhotonProperties): string {
  const parts: string[] = [];
  if (props.name && props.name !== props.street) {
    parts.push(props.name);
  }
  if (props.housenumber && props.street) {
    parts.push(`${props.housenumber} ${props.street}`);
  } else if (props.street) {
    parts.push(props.street);
  }
  if (props.district) {
    parts.push(props.district);
  }
  if (props.city) {
    parts.push(props.city);
  } else if (props.locality) {
    parts.push(props.locality);
  }
  if (props.state && props.state !== props.city) {
    parts.push(props.state);
  }
  if (props.country) {
    parts.push(props.country);
  }
  return [...new Set(parts)].join(", ");
}

function buildDisplayNameEn(props: PhotonProperties): string {
  const parts: string[] = [];
  if (props.name) {
    parts.push(props.name);
  }
  if (props.city) {
    parts.push(props.city);
  } else if (props.locality) {
    parts.push(props.locality);
  } else if (props.county) {
    parts.push(props.county);
  }
  if (props.country) {
    parts.push(props.country);
  }
  return [...new Set(parts)].join(", ");
}

function MapFlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 16, { duration: 0.8 });
  }, [map, center]);
  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onMapClick(e.latlng.lat, e.latlng.lng)
  });
  return null;
}

async function reverseGeocode(lat: number, lng: number): Promise<PhotonProperties | null> {
  try {
    const url = new URL("https://photon.komoot.io/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("lang", "vi");
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "MPC-Web-Admin/1.0" }
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return data?.features?.[0]?.properties ?? null;
  } catch {
    return null;
  }
}

export function LocationPicker({ initial, onChange, clearable = true, placeholder = "Chọn địa điểm..." }: Props) {
  const [open, setOpen] = useState(false);
  const [lat, setLat] = useState<number | null>(initial?.lat ?? null);
  const [lng, setLng] = useState<number | null>(initial?.lng ?? null);
  const [nameVi, setNameVi] = useState(initial?.nameVi ?? "");
  const [nameEn, setNameEn] = useState(initial?.nameEn ?? "");

  const [tempLat, setTempLat] = useState<number | null>(lat);
  const [tempLng, setTempLng] = useState<number | null>(lng);
  const [tempNameVi, setTempNameVi] = useState(nameVi);
  const [tempNameEn, setTempNameEn] = useState(nameEn);

  useEffect(() => {
    const newLat = initial?.lat ?? null;
    const newLng = initial?.lng ?? null;
    const newNameVi = initial?.nameVi ?? "";
    const newNameEn = initial?.nameEn ?? "";
    setLat(newLat);
    setLng(newLng);
    setNameVi(newNameVi);
    setNameEn(newNameEn);
  }, [initial?.lat, initial?.lng, initial?.nameVi, initial?.nameEn]);

  const handleOpen = () => {
    setTempLat(lat);
    setTempLng(lng);
    setTempNameVi(nameVi);
    setTempNameEn(nameEn);
    setOpen(true);
  };

  const handlePlaceSelect = useCallback((feature: PlaceFeature) => {
    const [lngVal, latVal] = feature.geometry.coordinates;
    const viName = buildDisplayNameVi(feature.properties);
    const enName = buildDisplayNameEn(feature.properties);
    setTempLat(latVal);
    setTempLng(lngVal);
    setTempNameVi(viName);
    setTempNameEn(enName);
  }, []);

  const handleMapClick = useCallback(async (clickedLat: number, clickedLng: number) => {
    setTempLat(clickedLat);
    setTempLng(clickedLng);
    // Reverse geocode to get address
    const props = await reverseGeocode(clickedLat, clickedLng);
    if (props) {
      setTempNameVi(buildDisplayNameVi(props));
      setTempNameEn(buildDisplayNameEn(props));
    } else {
      setTempNameVi(`${clickedLat.toFixed(5)}, ${clickedLng.toFixed(5)}`);
      setTempNameEn(`${clickedLat.toFixed(5)}, ${clickedLng.toFixed(5)}`);
    }
  }, []);

  const handleConfirm = () => {
    if (tempLat == null || tempLng == null) {
      return;
    }
    setLat(tempLat);
    setLng(tempLng);
    setNameVi(tempNameVi);
    setNameEn(tempNameEn);
    setOpen(false);
    onChange({
      lat: tempLat,
      lng: tempLng,
      displayNameVi: tempNameVi,
      displayNameEn: tempNameEn
    });
  };

  const handleClear = () => {
    setLat(null);
    setLng(null);
    setNameVi("");
    setNameEn("");
    onChange(null);
  };

  const hasLocation = lat != null && lng != null;
  const tempPosition: [number, number] | null = tempLat != null && tempLng != null ? [tempLat, tempLng] : null;
  const hasTempLocation = tempPosition !== null;

  return (
    <div className='space-y-2'>
      {}
      {hasLocation ? (
        <div className='flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2'>
          <MapPin className='h-4 w-4 shrink-0 text-primary/60' />
          <div className='min-w-0 flex-1'>
            <p className='truncate font-medium text-xs'>{nameVi}</p>
            {nameEn && nameEn !== nameVi && <p className='truncate text-[10px] text-muted-foreground'>{nameEn}</p>}
            <p className='text-[10px] text-muted-foreground/60'>
              {lat?.toFixed(5)}, {lng?.toFixed(5)}
            </p>
          </div>
          <div className='flex shrink-0 items-center gap-1'>
            <Button className='h-7 text-xs' onClick={handleOpen} size='sm' type='button' variant='outline'>
              Đổi
            </Button>
            {clearable && (
              <Button className='h-7 w-7 p-0' onClick={handleClear} size='sm' type='button' variant='ghost'>
                <X className='h-3.5 w-3.5' />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className='flex items-start gap-2'>
          <div className='relative flex-1'>
            <MapPin className='absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
            <Input
              className='h-9 pr-3 pl-8 text-xs'
              onChange={(e) => {
                const val = e.target.value;
                setNameVi(val);
                setNameEn(val);
                onChange({
                  lat: lat ?? 0,
                  lng: lng ?? 0,
                  displayNameVi: val,
                  displayNameEn: val
                });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
              placeholder={placeholder}
              value={nameVi}
            />
          </div>
          <Button
            className='h-9 shrink-0 gap-1.5 text-xs'
            onClick={handleOpen}
            size='sm'
            type='button'
            variant='outline'
          >
            <MapPin className='h-3.5 w-3.5' />
            Bản đồ
          </Button>
        </div>
      )}

      {}
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className='flex max-h-[90vh] max-w-4xl flex-col'>
          <DialogHeader>
            <DialogTitle className='text-sm'>Chọn địa điểm trên bản đồ</DialogTitle>
          </DialogHeader>

          <div className='flex-1 overflow-hidden rounded-lg border' style={{ height: "70vh" }}>
            <Map center={tempPosition ?? [10.762_622, 106.660_172]} zoom={hasTempLocation ? 16 : 5}>
              <MapTileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                darkUrl='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
                url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
              />
              <MapSearchControl
                debounceMs={800}
                lang='vi'
                limit={5}
                onPlaceSelect={handlePlaceSelect}
                placeholder='Tìm kiếm địa điểm...'
              />
              <MapZoomControl />
              <MapClickHandler onMapClick={handleMapClick} />
              {tempPosition && (
                <>
                  <MapFlyTo center={tempPosition} />
                  <MapMarker
                    draggable
                    eventHandlers={{
                      dragend: (e: DragEndEvent) => {
                        const pos = e.target.getLatLng();
                        setTempLat(pos.lat);
                        setTempLng(pos.lng);
                      }
                    }}
                    position={tempPosition}
                  />
                </>
              )}
            </Map>
          </div>

          {}
          <div className='space-y-3 pt-2'>
            {hasTempLocation && (
              <div className='flex items-center gap-4 text-[10px] text-muted-foreground'>
                <span className='flex items-center gap-1'>
                  <Navigation className='h-3 w-3' />
                  {tempLat?.toFixed(5)}, {tempLng?.toFixed(5)}
                </span>
                <a
                  className='text-primary hover:underline'
                  href={`https://www.openstreetmap.org/?mlat=${tempLat}&mlon=${tempLng}&zoom=17`}
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  Mở trên OpenStreetMap ↗
                </a>
              </div>
            )}

            <div className='grid grid-cols-2 gap-3'>
              <div className='grid gap-1.5'>
                <Label className='flex items-center gap-1 text-xs'>🇻🇳 Tên địa điểm (VI)</Label>
                <Input
                  className='h-8 text-xs'
                  onChange={(e) => setTempNameVi(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                  placeholder='VD: Hội trường A, ĐH Bách Khoa...'
                  value={tempNameVi}
                />
              </div>
              <div className='grid gap-1.5'>
                <Label className='flex items-center gap-1 text-xs'>🇬🇧 Location name (EN)</Label>
                <Input
                  className='h-8 text-xs'
                  onChange={(e) => setTempNameEn(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                  placeholder='e.g. Hall A, University of Technology...'
                  value={tempNameEn}
                />
              </div>
            </div>
          </div>

          <DialogFooter className='mt-3'>
            <Button className='text-xs' onClick={() => setOpen(false)} type='button' variant='outline'>
              Hủy
            </Button>
            <Button className='text-xs' disabled={!hasTempLocation} onClick={handleConfirm} type='button'>
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
