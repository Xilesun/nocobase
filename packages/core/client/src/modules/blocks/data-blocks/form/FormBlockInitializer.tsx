/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { FormOutlined } from '@ant-design/icons';
import React, { useCallback } from 'react';
import { useSchemaInitializer, useSchemaInitializerItem } from '../../../../application';
import { Collection, CollectionFieldOptions } from '../../../../data-source/collection/Collection';
import { DataBlockInitializer } from '../../../../schema-initializer/items/DataBlockInitializer';
import { createCreateFormBlockUISchema } from './createCreateFormBlockUISchema';

export const FormBlockInitializer = ({
  filterCollections,
  onlyCurrentDataSource,
  hideSearch,
  createBlockSchema,
  componentType = 'FormItem',
  templateWrap: customizeTemplateWrap,
  showAssociationFields,
  hideChildrenIfSingleCollection,
  hideOtherRecordsInPopup,
}: {
  filterCollections: (options: { collection?: Collection; associationField?: CollectionFieldOptions }) => boolean;
  onlyCurrentDataSource: boolean;
  hideSearch?: boolean;
  createBlockSchema?: (options: any) => any;
  /**
   * 虽然这里的命名现在看起来比较奇怪，但为了兼容旧版本的 template，暂时保留这个命名。
   */
  componentType?: 'FormItem';
  templateWrap?: (
    templateSchema: any,
    {
      item,
    }: {
      item: any;
    },
  ) => any;
  showAssociationFields?: boolean;
  hideChildrenIfSingleCollection?: boolean;
  /**
   * 隐藏弹窗中的 Other records 选项
   */
  hideOtherRecordsInPopup?: boolean;
}) => {
  const itemConfig = useSchemaInitializerItem();
  const { createFormBlock, templateWrap } = useCreateFormBlock();
  const onCreateFormBlockSchema = useCallback(
    (options) => {
      if (createBlockSchema) {
        return createBlockSchema(options);
      }

      createFormBlock(options);
    },
    [createBlockSchema, createFormBlock],
  );
  const doTemplateWrap = useCallback(
    (templateSchema, options) => {
      if (customizeTemplateWrap) {
        return customizeTemplateWrap(templateSchema, options);
      }

      return templateWrap(templateSchema, options);
    },
    [customizeTemplateWrap, templateWrap],
  );

  return (
    <DataBlockInitializer
      {...itemConfig}
      icon={<FormOutlined />}
      componentType={componentType}
      templateWrap={doTemplateWrap}
      onCreateBlockSchema={onCreateFormBlockSchema}
      filter={filterCollections}
      onlyCurrentDataSource={onlyCurrentDataSource}
      hideSearch={hideSearch}
      showAssociationFields={showAssociationFields}
      hideChildrenIfSingleCollection={hideChildrenIfSingleCollection}
      hideOtherRecordsInPopup={hideOtherRecordsInPopup}
    />
  );
};

export const useCreateFormBlock = () => {
  const { insert } = useSchemaInitializer();
  const itemConfig = useSchemaInitializerItem();
  const { isCusomeizeCreate: isCustomizeCreate } = itemConfig;

  const createFormBlock = useCallback(
    ({ item }) => {
      insert(
        createCreateFormBlockUISchema({
          collectionName: item.collectionName || item.name,
          dataSource: item.dataSource,
          isCusomeizeCreate: isCustomizeCreate,
        }),
      );
    },
    [insert, isCustomizeCreate],
  );

  const templateWrap = useCallback(
    (templateSchema, { item }) => {
      const schema = createCreateFormBlockUISchema({
        isCusomeizeCreate: isCustomizeCreate,
        dataSource: item.dataSource,
        templateSchema: templateSchema,
        collectionName: item.name,
      });
      if (item.template && item.mode === 'reference') {
        schema['x-template-key'] = item.template.key;
      }
      return schema;
    },
    [isCustomizeCreate],
  );

  return {
    createFormBlock,
    templateWrap,
  };
};
