import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { Request } from 'express'
import { Repository } from 'typeorm'
import { i18n } from '~/config/i18n'
import { useQuery } from '~/core/modules/hooks/useQuery'
import ErrorResponse from '~/core/modules/response/ErrorResponse'
import { AppDataSource } from '~/database/datasource'
import BaseService from '../base.service'

// Mock dependencies
jest.mock('~/core/modules/hooks/useQuery')
jest.mock('~/database/datasource', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}))

jest.mock('~/config/i18n', () => ({
  i18n: {
    t: jest.fn(),
  },
}))

describe('BaseService', () => {
  let baseService: BaseService<any>
  let mockRepository: jest.Mocked<Repository<any>>

  beforeEach(() => {
    mockRepository = {
      createQueryBuilder: jest.fn().mockReturnThis(),
      // Add other necessary mock methods
      findOne: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      softDelete: jest.fn(),
      delete: jest.fn(),
    } as any

    jest.spyOn(AppDataSource, 'getRepository').mockReturnValue(mockRepository)

    baseService = new BaseService({
      tableName: 'test_table',
      entity: {} as any,
    })
    baseService.repository = mockRepository
  })

  describe('findAll', () => {
    it('should return data, total, and message', async () => {
      // Arrange
      const mockRequest = {
        getQuery: jest.fn().mockReturnValue({}),
      } as unknown as Request

      const mockNewQuery = {
        // @ts-expect-error
        getMany: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
        // @ts-expect-error
        getCount: jest.fn().mockResolvedValue(2),
      }

      ;(useQuery as jest.Mock).mockReturnValue(mockNewQuery)

      // Act
      const result = await baseService.findAll(mockRequest)

      // Assert
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(
        'test_table'
      )
      expect(useQuery).toHaveBeenCalledWith({
        entity: 'test_table',
        query: expect.any(Object),
        reqQuery: {},
      })
      expect(mockNewQuery.getMany).toHaveBeenCalled()
      expect(mockNewQuery.getCount).toHaveBeenCalled()
      expect(result).toEqual({
        data: [{ id: 1 }, { id: 2 }],
        total: 2,
        message: '2 data has been received',
      })
    })
  })

  describe('_findOne', () => {
    it('should return data when found', async () => {
      const mockData = { id: '1', name: 'Test' }
      // @ts-expect-error
      const mockFindOne = jest.fn().mockResolvedValue(mockData)
      ;(baseService.repository.findOne as jest.Mock) = mockFindOne

      const result = await (baseService as any)._findOne({ where: { id: '1' } })

      expect(result).toEqual(mockData)
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: undefined,
        withDeleted: undefined,
      })
    })

    it('should throw NotFound error when data is not found', async () => {
      // @ts-expect-error
      const mockFindOne = jest.fn().mockResolvedValue(null)
      ;(baseService.repository.findOne as jest.Mock) = mockFindOne
      // @ts-expect-error
      ;(i18n.t as jest.Mock).mockReturnValue('Not found error message')

      await expect(
        (baseService as any)._findOne({ where: { id: '1' } })
      ).rejects.toThrow(ErrorResponse.NotFound)

      expect(i18n.t).toHaveBeenCalledWith(
        'errors.not_found',
        expect.any(Object)
      )
    })

    it('should use provided language for i18n', async () => {
      // @ts-expect-error
      const mockFindOne = jest.fn().mockResolvedValue(null)
      ;(baseService.repository.findOne as jest.Mock) = mockFindOne
      // @ts-expect-error
      ;(i18n.t as jest.Mock).mockReturnValue('Not found error message')

      await expect(
        (baseService as any)._findOne({ where: { id: '1' }, lang: 'fr' })
      ).rejects.toThrow(ErrorResponse.NotFound)

      expect(i18n.t).toHaveBeenCalledWith(
        'errors.not_found',
        expect.objectContaining({ lng: 'fr' })
      )
    })
  })

  describe('update', () => {
    it('should update and return the entity', async () => {
      const mockId = '65edb905-9c28-4dbd-837d-20db22318185'
      const mockFormData = { name: 'Updated Name' }
      const mockExistingEntity = { id: mockId, name: 'Original Name' }
      const mockUpdatedEntity = { ...mockExistingEntity, ...mockFormData }

      mockRepository.findOne.mockResolvedValue(mockExistingEntity)
      mockRepository.save.mockResolvedValue(mockUpdatedEntity)

      const result = await baseService.update(mockId, mockFormData)

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockId },
      })
      expect(mockRepository.save).toHaveBeenCalledWith(mockUpdatedEntity)
      expect(result).toEqual(mockUpdatedEntity)
    })

    it('should throw NotFound error if entity does not exist', async () => {
      const mockId = 'bde3ba09-aa25-46cb-8e6c-c9f2c3540c05'
      mockRepository.findOne.mockResolvedValue(null)

      await expect(baseService.update(mockId, {})).rejects.toThrow(
        ErrorResponse.NotFound
      )
    })
  })

  describe('restore', () => {
    it('should restore a soft-deleted entity', async () => {
      const mockId = '2a610428-bf38-49a9-ae41-3f659d699253'
      const mockEntity = { id: mockId, name: 'Test Entity' }

      mockRepository.findOne.mockResolvedValue(mockEntity)
      // @ts-expect-error
      mockRepository.restore.mockResolvedValue(undefined)

      await baseService.restore(mockId)

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockId },
        withDeleted: true,
      })
      expect(mockRepository.restore).toHaveBeenCalledWith(mockId)
    })

    it('should throw NotFound error if entity does not exist', async () => {
      const mockId = '6858eefd-a8c4-49b1-b420-896fe70f553d'
      mockRepository.findOne.mockResolvedValue(null)

      await expect(baseService.restore(mockId)).rejects.toThrow(
        ErrorResponse.NotFound
      )
    })
  })

  describe('softDelete', () => {
    it('should soft delete an entity by id', async () => {
      const mockId = '50a41833-c844-4541-a518-7feab3cc7717'
      const mockEntity = { id: mockId }

      mockRepository.findOne.mockResolvedValue(mockEntity)

      await baseService.softDelete(mockId)

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockId },
      })
      expect(mockRepository.softDelete).toHaveBeenCalledWith(mockId)
    })

    it('should throw an error if entity is not found', async () => {
      const mockId = 'd3aef0c6-9027-469e-82e6-2a8f161f7272'

      mockRepository.findOne.mockResolvedValue(null)

      await expect(baseService.softDelete(mockId)).rejects.toThrow()
    })
  })

  describe('forceDelete', () => {
    it('should delete the entity with the given id', async () => {
      const mockId = '50a41833-c844-4541-a518-7feab3cc7717'
      const mockData = { id: mockId }
      mockRepository.findOne.mockResolvedValue(mockData)

      await baseService.forceDelete(mockId)

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockId },
      })
      expect(mockRepository.delete).toHaveBeenCalledWith(mockId)
    })

    it('should throw NotFound error if entity does not exist', async () => {
      const mockId = '50a41833-c844-4541-a518-7feab3cc7717'
      mockRepository.findOne.mockResolvedValue(null)

      await expect(baseService.forceDelete(mockId)).rejects.toThrow(
        ErrorResponse.NotFound
      )
    })
  })
})
