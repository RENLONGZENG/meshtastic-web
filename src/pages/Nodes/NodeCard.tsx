import type React from 'react';
import { useEffect, useState } from 'react';

import { m } from 'framer-motion';
import { LngLat } from 'mapbox-gl';
import { BiCrown } from 'react-icons/bi';
import {
  FiAlignLeft,
  FiCode,
  FiMapPin,
  FiSliders,
  FiUser,
} from 'react-icons/fi';
import { IoTelescope } from 'react-icons/io5';
import { MdGpsFixed, MdGpsNotFixed, MdGpsOff } from 'react-icons/md';
import JSONPretty from 'react-json-pretty';

import { IconButton } from '@components/generic/button/IconButton';
import { CollapsibleSection } from '@components/generic/Sidebar/CollapsibleSection';
import { SidebarOverlay } from '@components/generic/Sidebar/SidebarOverlay';
import { Tooltip } from '@components/generic/Tooltip';
import { SidebarItem } from '@components/layout/Sidebar/SidebarItem';
import { CopyButton } from '@components/menu/buttons/CopyButton';
import type { Node } from '@core/slices/meshtasticSlice';
import { Hashicon } from '@emeraldpay/hashicon-react';
import { useMapbox } from '@hooks/useMapbox';

type PositionConfidence = 'high' | 'low' | 'none';

export interface NodeCardProps {
  node: Node;
  isMyNode: boolean;
  selected: boolean;
  setSelected: () => void;
}

export const NodeCard = ({
  node,
  isMyNode,
  selected,
  setSelected,
}: NodeCardProps): JSX.Element => {
  const { map } = useMapbox();
  const [infoOpen, setInfoOpen] = useState(false);
  const [PositionConfidence, setPositionConfidence] =
    useState<PositionConfidence>('none');

  useEffect(() => {
    setPositionConfidence(
      node.currentPosition
        ? new Date(node.currentPosition.posTimestamp * 1000) >
          new Date(new Date().getTime() - 1000 * 60 * 30)
          ? 'high'
          : 'low'
        : 'none',
    );
  }, [node.currentPosition]);
  return (
    <>
      <SidebarItem
        selected={selected}
        setSelected={setSelected}
        actions={
          <>
            <IconButton
              nested
              tooltip={PositionConfidence !== 'none' ? 'Fly to Node' : ''}
              disabled={PositionConfidence === 'none'}
              onClick={(e): void => {
                e.stopPropagation();
                setSelected();
                if (PositionConfidence !== 'none' && node.currentPosition) {
                  map?.flyTo({
                    center: new LngLat(
                      node.currentPosition.longitudeI / 1e7,
                      node.currentPosition.latitudeI / 1e7,
                    ),
                    zoom: 16,
                  });
                }
              }}
              icon={
                PositionConfidence === 'high' ? (
                  <MdGpsFixed />
                ) : PositionConfidence === 'low' ? (
                  <MdGpsNotFixed />
                ) : (
                  <MdGpsOff />
                )
              }
            />
            <IconButton
              nested
              tooltip="Show Node Info"
              onClick={(e): void => {
                e.stopPropagation();
                setInfoOpen(true);
              }}
              icon={<FiAlignLeft />}
            />
          </>
        }
      >
        <div className="flex dark:text-white">
          <div className="relative m-auto">
            {isMyNode && (
              <Tooltip content="Your Node">
                <m.div
                  whileHover={{ scale: 1.05 }}
                  className="absolute -right-1 -top-1 rounded-full bg-yellow-500 p-0.5"
                >
                  <BiCrown className="h-3 w-3" />
                </m.div>
              </Tooltip>
            )}
            <Hashicon value={node.number.toString()} size={32} />
          </div>
        </div>
        <div className="my-auto mr-auto text-xs font-semibold dark:text-gray-400">
          {node.lastHeard.getTime()
            ? node.lastHeard.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Never'}
        </div>
      </SidebarItem>
      <SidebarOverlay
        title={`Node ${node.user?.longName ?? 'UNK'} `}
        open={infoOpen}
        close={(): void => {
          setInfoOpen(false);
        }}
        direction="x"
      >
        <CollapsibleSection title="User" icon={<FiUser />}>
          <div className="flex  p-2">
            <div className="m-auto flex flex-col gap-2">
              <Hashicon value={node.number.toString()} size={180} />
              <div className="text-center text-lg font-medium dark:text-white">
                {node?.user?.longName || 'Unknown'}
              </div>
            </div>
          </div>
        </CollapsibleSection>
        <CollapsibleSection title="Location" icon={<FiMapPin />}>
          <>
            <div className="flex h-10 select-none justify-between rounded-md border border-gray-400 bg-transparent bg-gray-300 px-1 text-gray-500 dark:border-gray-600 dark:bg-secondaryDark dark:text-gray-400 ">
              {node.currentPosition ? (
                <>
                  <div className="my-auto px-1">
                    {(node.currentPosition.latitudeI / 1e7).toPrecision(6)}
                    ,&nbsp;
                    {(node.currentPosition?.longitudeI / 1e7).toPrecision(6)}
                  </div>
                  <CopyButton
                    data={
                      node.currentPosition
                        ? `${node.currentPosition.latitudeI / 1e7},${
                            node.currentPosition.longitudeI / 1e7
                          }`
                        : ''
                    }
                  />
                </>
              ) : (
                <div className="my-auto px-1">No location data received</div>
              )}
            </div>
          </>
        </CollapsibleSection>
        <CollapsibleSection title="Line of Sight" icon={<IoTelescope />}>
          <div>Info</div>
        </CollapsibleSection>
        <CollapsibleSection title="Administration" icon={<FiSliders />}>
          <div>Info</div>
        </CollapsibleSection>
        <CollapsibleSection title="Debug" icon={<FiCode />}>
          <>
            <div className="fixed right-0 mr-6">
              <CopyButton data={JSON.stringify(node)} />
            </div>
            <JSONPretty className="max-w-sm" data={node} />
          </>
        </CollapsibleSection>
      </SidebarOverlay>
    </>
  );
};
