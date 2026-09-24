import { Response } from 'express';

/**
 * Base Laravel-style Controller
 * Provides standardized response formatting conforming to Laravel API specifications
 */
export abstract class Controller {
  /**
   * Return a standardized success response (Laravel API Resource format)
   */
  protected success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200,
    meta?: Record<string, any>
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      ...(meta ? { meta } : {}),
    });
  }

  /**
   * Return a standardized error response
   */
  protected error(
    res: Response,
    message = 'An error occurred',
    errors?: Record<string, string[]> | any,
    statusCode = 400
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors ? { errors } : {}),
    });
  }

  /**
   * Return a paginated response (Laravel LengthAwarePaginator format)
   */
  protected paginated<T>(
    res: Response,
    items: T[],
    total: number,
    page: number,
    perPage: number,
    message = 'Resource list retrieved'
  ): Response {
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const from = total === 0 ? null : (page - 1) * perPage + 1;
    const to = total === 0 ? null : Math.min(page * perPage, total);

    return res.status(200).json({
      data: items,
      meta: {
        current_page: page,
        from,
        last_page: lastPage,
        per_page: perPage,
        to,
        total,
      },
      links: {
        first: `?page=1&per_page=${perPage}`,
        last: `?page=${lastPage}&per_page=${perPage}`,
        prev: page > 1 ? `?page=${page - 1}&per_page=${perPage}` : null,
        next: page < lastPage ? `?page=${page + 1}&per_page=${perPage}` : null,
      },
      message,
    });
  }

  /**
   * Return a 404 Not Found response
   */
  protected notFound(res: Response, message = 'Resource not found'): Response {
    return res.status(404).json({
      success: false,
      message,
    });
  }
}
