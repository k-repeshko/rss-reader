﻿using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using LightRssReader.Web.Dto;
using LightRssReader.BusinessLayer.Entities;
using LightRssReader.BusinessLayer.Services;

namespace LightRssReader.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FeedController : ControllerBase
{
    private readonly ILogger<FeedController> _logger;
    private readonly IMapper _mapper;
    private readonly IFeedService _feedService;
    private readonly ITelegramClient _t;

    public FeedController(
      ILogger<FeedController> logger,
      IMapper mapper,
      IFeedService feedService,
      ITelegramClient t
      )
    {
        _logger = logger;
        _mapper = mapper;
        _feedService = feedService;
        _t = t;
    }

    [HttpGet]
    public async Task<IEnumerable<FeedDto>> Get()
    {
        var feeds = await _feedService.List();
        return feeds.Select(_mapper.Map<FeedDto>);
    }

    [HttpPost]
    public async Task<FeedDto> Add(PostFeedDto dto)
    {
        var feed = _mapper.Map<Feed>(dto);
        feed = await _feedService.Add(feed);
        return _mapper.Map<FeedDto>(feed);
    }

    [HttpPut("{feedId}")]
    public async Task<IActionResult> Update(long feedId, PostFeedDto dto)
    {
        var feed = await _feedService.Get(feedId);
        if (feed == null)
        {
            return NotFound();
        }

        var newFeed = _mapper.Map(dto, feed);
        newFeed = await _feedService.Update(newFeed);
        return Ok(_mapper.Map<FeedDto>(newFeed));
    }

    [HttpDelete("{feedId}")]
    public async Task<IActionResult> Delete(long feedId)
    {
        var feed = await _feedService.Get(feedId);
        if (feed == null)
        {
            return NotFound();
        }

        await _feedService.Delete(feed);

        return Ok();
    }

    [HttpPost("{feedId}/restore")]
    public async Task<IActionResult> Restore(long feedId)
    {
        var feed = await _feedService.Get(feedId);
        if (feed == null)
        {
            return NotFound();
        }

        await _feedService.Restore(feed);

        return Ok();
    }
}
